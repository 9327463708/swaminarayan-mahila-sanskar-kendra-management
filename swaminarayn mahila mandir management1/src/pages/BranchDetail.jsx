import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReceiptTemplate from '../components/ReceiptTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


import { collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy, updateDoc, ref, uploadBytes, getDownloadURL, deleteObject, db, storage } from '../firebase';

const mapLinks = {
  amreli: "https://maps.app.goo.gl/Jttv5mWBabeNXUcJA",
  ahmedabad: "https://maps.app.goo.gl/bNyfPDzw4PH8pbas8",
  surat: "https://maps.app.goo.gl/6w9mDgkH6gRwoL3v8",
  botad: "https://maps.app.goo.gl/L6XoKmtRtUArxb9m8",
  rajkot: "https://maps.google.com/?q=Rajkot",
  vadodara: "https://maps.google.com/?q=Vadodara"
};

const BranchDetail = ({ isAdmin = false }) => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for active receipt data (for PDF generation)
  const [activeReceiptData, setActiveReceiptData] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null); // Modal state
  
  // Padhramani form state
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pHetu, setPHetu] = useState('');

  // Atmiya Sabha Attendance state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNumber, setNewMemberNumber] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  // Yuvti Sabha Attendance state
  const [newYuvtiName, setNewYuvtiName] = useState('');
  const [newYuvtiNumber, setNewYuvtiNumber] = useState('');
  const [yuvtiSearch, setYuvtiSearch] = useState('');
  
  // Tabs State
  const [activeAdminTab, setActiveAdminTab] = useState(isAdmin ? 'receipt' : 'announcement');

  // Data State
  const [branchReceipts, setBranchReceipts] = useState([]);
  const [padhramaniRequests, setPadhramaniRequests] = useState([]);
  const [mahilaMembers, setMahilaMembers] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [yuvtiMembers, setYuvtiMembers] = useState([]);
  const [todayYuvtiAttendance, setTodayYuvtiAttendance] = useState([]);
  const currentDate = new Date().toISOString().split('T')[0];
  const [branchMedia, setBranchMedia] = useState([]);

  const [sabhaAnnouncements, setSabhaAnnouncements] = useState([]);
  const [translatedAnnouncements, setTranslatedAnnouncements] = useState([]);

  // Auto-translate announcements
  useEffect(() => {
    const translateAnns = async () => {
      if (i18n.language === 'en') {
        setTranslatedAnnouncements(sabhaAnnouncements);
        return;
      }
      
      const fetchTranslation = async (text, targetLang) => {
        if (!text) return text;
        try {
          const res = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(text));
          const data = await res.json();
          let translated = '';
          for (let i = 0; i < data[0].length; i++) {
            translated += data[0][i][0];
          }
          return translated;
        } catch (e) {
          return text;
        }
      };

      const newAnns = [];
      for (let ann of sabhaAnnouncements) {
         const transAnn = { ...ann };
         transAnn.dateDay = await fetchTranslation(ann.dateDay, i18n.language);
         transAnn.tithi = await fetchTranslation(ann.tithi, i18n.language);
         transAnn.loc = await fetchTranslation(ann.loc, i18n.language);
         transAnn.vakta = await fetchTranslation(ann.vakta, i18n.language);
         transAnn.food = await fetchTranslation(ann.food, i18n.language);
         newAnns.push(transAnn);
      }
      setTranslatedAnnouncements(newAnns);
    };
    
    translateAnns();
  }, [sabhaAnnouncements, i18n.language]);

  const [aLoc, setALoc] = useState('');
  const [aDateDay, setADateDay] = useState('');
  const [aTithi, setATithi] = useState('');
  const [aVakta, setAVakta] = useState('');
  const [aFood, setAFood] = useState('');

  const receiptRef = useRef(null);

  
  const [activeMediaTab, setActiveMediaTab] = useState('image'); // 'image' or 'video'
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);


  const branchName = t(id.charAt(0).toUpperCase() + id.slice(1));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load Receipts
        const receiptsQuery = query(collection(db, 'receipts'), where('branchId', '==', id));
        const receiptsSnapshot = await getDocs(receiptsQuery);
        const receiptsData = receiptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBranchReceipts(receiptsData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));

        // Load Padhramani
        const padhramaniQuery = query(collection(db, 'padhramani'), where('branchId', '==', id));
        const padhramaniSnapshot = await getDocs(padhramaniQuery);
        const padhramaniData = padhramaniSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPadhramaniRequests(padhramaniData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));

          // Load Mahila Members
          const membersQuery = query(collection(db, 'mahila_members'), where('branchId', '==', id));
          const membersSnapshot = await getDocs(membersQuery);
          const membersData = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMahilaMembers(membersData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
  
          // Load Today's Attendance
          const attQuery = query(collection(db, 'sabha_attendance'), where('branchId', '==', id), where('date', '==', currentDate));
          const attSnapshot = await getDocs(attQuery);
          if (!attSnapshot.empty) {
            setTodayAttendance(attSnapshot.docs[0].data().present || []);
          }

          // Load Yuvti Members
          const yuvtiQuery = query(collection(db, 'yuvti_members'), where('branchId', '==', id));
          const yuvtiSnapshot = await getDocs(yuvtiQuery);
          const yuvtiData = yuvtiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setYuvtiMembers(yuvtiData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
  
          // Load Today's Yuvti Attendance
          const yuvtiAttQuery = query(collection(db, 'yuvti_attendance'), where('branchId', '==', id), where('date', '==', currentDate));
          const yuvtiAttSnapshot = await getDocs(yuvtiAttQuery);
          if (!yuvtiAttSnapshot.empty) {
            setTodayYuvtiAttendance(yuvtiAttSnapshot.docs[0].data().present || []);
          }

        // Load Media
        const mediaQuery = query(collection(db, 'media'), where('branchId', '==', id));
        const mediaSnapshot = await getDocs(mediaQuery);
        const mediaData = mediaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBranchMedia(mediaData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleMediaUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      try {
        const storageRef = ref(storage, `media/${id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        const newMedia = {
          branchId: id,
          type,
          url,
          storagePath: snapshot.ref.fullPath,
          timestamp: Date.now()
        };

        const docRef = await addDoc(collection(db, 'media'), newMedia);
        setBranchMedia(prev => [{ id: docRef.id, ...newMedia }, ...prev]);
        setActiveMediaTab(type);
      } catch (error) {
        console.error("Error uploading media:", error);
        alert("Photo upload failed! Please check your Firebase Storage Rules. Error: " + error.message);
      }
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      const mediaToDelete = branchMedia.find(m => m.id === mediaId);
      if (!mediaToDelete) return;

      if (mediaToDelete.storagePath) {
        const storageRef = ref(storage, mediaToDelete.storagePath);
        try {
          await deleteObject(storageRef);
        } catch (e) {
          console.error("Error deleting from storage", e);
        }
      }
      await deleteDoc(doc(db, 'media', mediaId));
      setBranchMedia(prev => prev.filter(m => m.id !== mediaId));
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  const handlePadhramaniSubmit = async (e) => {
    e.preventDefault();
    if(pName && pPhone && pAddress && pHetu) {
      const newRequest = {
        branchId: id,
        date: new Date().toLocaleDateString('gu-IN'),
        name: pName,
        phone: pPhone,
        address: pAddress,
        hetu: pHetu,
        timestamp: Date.now()
      };
      
      try {
        const docRef = await addDoc(collection(db, 'padhramani'), newRequest);
        setPadhramaniRequests(prev => [{ id: docRef.id, ...newRequest }, ...prev]);
        
        setPName('');
        setPPhone('');
        setPAddress('');
        setPHetu('');
        alert("તમારી પધરામણીની વિનંતી સફળતાપૂર્વક નોંધાઈ ગઈ છે! (Padhramani Request Submitted!)");
      } catch (error) {
        console.error("Error submitting padhramani request:", error);
        alert("Error submitting padhramani request");
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (newMemberName.trim() && newMemberNumber.trim()) {
      if (!/^[a-zA-Z]\d{2}$/.test(newMemberNumber.trim())) {
         alert("Number must be 1 letter and 2 digits (e.g., M24)");
         return;
      }
      try {
        const newMember = { 
          branchId: id, 
          name: newMemberName.trim(), 
          hajariNumber: newMemberNumber.trim().toUpperCase(),
          timestamp: Date.now() 
        };
        const docRef = await addDoc(collection(db, 'mahila_members'), newMember);
        setMahilaMembers([{ id: docRef.id, ...newMember }, ...mahilaMembers]);
        setNewMemberName('');
        setNewMemberNumber('');
      } catch (err) {
        console.error("Error adding member:", err);
      }
    }
  };

  const handleDeleteMember = async (memberId) => {
    if(window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteDoc(doc(db, 'mahila_members', memberId));
        setMahilaMembers(prev => prev.filter(m => m.id !== memberId));
      } catch (err) {
        console.error("Error deleting member:", err);
        alert("Delete Failed: " + err.message);
      }
    }
  };

  const handleDeleteYuvti = async (memberId) => {
    if(window.confirm('Are you sure you want to delete this yuvti?')) {
      try {
        await deleteDoc(doc(db, 'yuvti_members', memberId));
        setYuvtiMembers(prev => prev.filter(m => m.id !== memberId));
      } catch (err) {
        console.error("Error deleting yuvti:", err);
        alert("Delete Failed: " + err.message);
      }
    }
  };

  const handleDeleteReceipt = async (receiptId) => {
    if(window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        await deleteDoc(doc(db, 'receipts', receiptId));
        setBranchReceipts(prev => prev.filter(r => r.id !== receiptId));
      } catch (err) {
        console.error("Error deleting receipt:", err);
        alert("Delete Failed: " + err.message);
      }
    }
  };

  const handleDeletePadhramani = async (padhId) => {
    if(window.confirm('Are you sure you want to delete this padhramani request?')) {
      try {
        await deleteDoc(doc(db, 'padhramani', padhId));
        setPadhramaniRequests(prev => prev.filter(p => p.id !== padhId));
      } catch (err) {
        console.error("Error deleting padhramani:", err);
        alert("Delete Failed: " + err.message);
      }
    }
  };

  const handleToggleAttendance = async (memberId) => {
    const isPresent = todayAttendance.includes(memberId);
    const newPresent = isPresent ? todayAttendance.filter(i => i !== memberId) : [...todayAttendance, memberId];
    setTodayAttendance(newPresent);
    
    try {
      const attQuery = query(collection(db, 'sabha_attendance'), where('branchId', '==', id), where('date', '==', currentDate));
      const attSnapshot = await getDocs(attQuery);
      if (attSnapshot.empty) {
        await addDoc(collection(db, 'sabha_attendance'), { branchId: id, date: currentDate, present: newPresent, timestamp: Date.now() });
      } else {
        await updateDoc(doc(db, 'sabha_attendance', attSnapshot.docs[0].id), { present: newPresent });
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
    }
  };

  const handleAddYuvti = async (e) => {
    e.preventDefault();
    if (newYuvtiName.trim() && newYuvtiNumber.trim()) {
      if (!/^[a-zA-Z]\d{2}$/.test(newYuvtiNumber.trim())) {
         alert("Number must be 1 letter and 2 digits (e.g., Y24)");
         return;
      }
      try {
        const newMember = { 
          branchId: id, 
          name: newYuvtiName.trim(), 
          hajariNumber: newYuvtiNumber.trim().toUpperCase(),
          timestamp: Date.now() 
        };
        const docRef = await addDoc(collection(db, 'yuvti_members'), newMember);
        setYuvtiMembers([{ id: docRef.id, ...newMember }, ...yuvtiMembers]);
        setNewYuvtiName('');
        setNewYuvtiNumber('');
      } catch (err) {
        console.error("Error adding yuvti:", err);
      }
    }
  };

  const handleToggleYuvtiAttendance = async (memberId) => {
    const isPresent = todayYuvtiAttendance.includes(memberId);
    const newPresent = isPresent ? todayYuvtiAttendance.filter(i => i !== memberId) : [...todayYuvtiAttendance, memberId];
    setTodayYuvtiAttendance(newPresent);
    
    try {
      const attQuery = query(collection(db, 'yuvti_attendance'), where('branchId', '==', id), where('date', '==', currentDate));
      const attSnapshot = await getDocs(attQuery);
      if (attSnapshot.empty) {
        await addDoc(collection(db, 'yuvti_attendance'), { branchId: id, date: currentDate, present: newPresent, timestamp: Date.now() });
      } else {
        await updateDoc(doc(db, 'yuvti_attendance', attSnapshot.docs[0].id), { present: newPresent });
      }
    } catch (err) {
      console.error("Error updating yuvti attendance:", err);
    }
  };

  const generatePDF = async (data) => {
    setIsGenerating(true);
    setActiveReceiptData(data);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, 
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${data.name.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error("Error generating receipt", error);
      alert("Error generating receipt");
    } finally {
      setIsGenerating(false);
      setActiveReceiptData(null);
    }
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    if(!donorName || !amount) {
      alert("Please enter Name and Amount.");
      return;
    }

    const newReceipt = {
      branchId: id,
      date: new Date().toLocaleDateString('gu-IN'),
      name: donorName,
      mobile: mobile,
      address: address,
      amount: amount,
      purpose: purpose || "Mandir / Sabha",
      timestamp: Date.now()
    };
    
    try {
      await new Promise(r => setTimeout(r, 100));
      await generatePDF(newReceipt);
      
      const docRef = await addDoc(collection(db, 'receipts'), newReceipt);
      setBranchReceipts(prev => [{ id: docRef.id, ...newReceipt }, ...prev]);
      
      setDonorName('');
      setAmount('');
      setMobile('');
      setAddress('');
      setPurpose('');
      alert('Receipt generated and saved successfully!');
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("Error: " + error.message);
    }
  };

  const handleDownloadOld = (receipt) => {
    generatePDF(receipt);
  };

  

  const searchQuery = ''; // Added to prevent ReferenceError
  
  // Filter by search query
  const filteredReceipts = branchReceipts
    .filter(r => 
      searchQuery === '' || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.mobile && r.mobile.includes(searchQuery))
    );

  const filteredPadhramani = padhramaniRequests
    .filter(r => 
      searchQuery === '' || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery)
    );

  
  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative">
      
      {/* Media Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 font-bold transition-transform hover:scale-110"
              onClick={() => setSelectedMedia(null)}
            >
              &times;
            </button>
            {selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt="Enlarged view" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border-4 border-white/20"
              />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border-4 border-white/20"
              />
            )}
          </div>
        </div>
      )}

      {/* Hidden Receipt Template for PDF Generation */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
         <ReceiptTemplate 
           ref={receiptRef} 
           donorDetails={activeReceiptData || { name: 'Donor', amount: '0', mobile: '', address: '', purpose: '' }} 
           branchName={branchName} 
         />
      </div>

      {/* Branch Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-8 mb-8 shadow-md">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md mb-4 tracking-tight">
            {branchName} {!['common', 'darshan'].includes(id) && t('branch')}
          </h2>
          {!['common', 'darshan'].includes(id) && isAdmin && (
            <a 
              href={mapLinks[id]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white text-orange-600 font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-orange-50 transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="mr-2 text-orange-600">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
              </svg>
              {t('view_map')}
            </a>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">

        {/* Media & Leaders Grid */}
        <div className={`grid grid-cols-1 ${!['common', 'darshan'].includes(id) ? 'lg:grid-cols-2' : ''} gap-6 mb-12`}>
          {/* Photos & Videos Section */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold flex items-center text-gray-800">
                <span className="text-2xl mr-2 text-orange-500">📸</span> {t('photos_videos')}
              </h3>
              {isAdmin && (
                <div className="flex space-x-2">
                  <label className="cursor-pointer bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center">
                    <span className="mr-1">+</span> Photo
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'image')} />
                  </label>
                  <label className="cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center">
                    <span className="mr-1">+</span> Video
                    <input type="file" multiple accept="video/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'video')} />
                  </label>
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-4 mb-4 border-b border-gray-200">
              <button 
                onClick={() => setActiveMediaTab('image')}
                className={`pb-2 px-1 font-semibold text-sm transition-colors ${activeMediaTab === 'image' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Photos Folder
              </button>
              <button 
                onClick={() => setActiveMediaTab('video')}
                className={`pb-2 px-1 font-semibold text-sm transition-colors ${activeMediaTab === 'video' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Videos Folder
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-1">
              {branchMedia.filter(m => m.type === activeMediaTab).length > 0 ? (
                <div className={`grid grid-cols-2 ${['common', 'darshan'].includes(id) ? 'md:grid-cols-4 lg:grid-cols-6' : ''} gap-4`}>
                  {branchMedia.filter(m => m.type === activeMediaTab).map((media) => (
                    <div key={media.id} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200 aspect-square bg-black flex items-center justify-center cursor-pointer" onClick={() => setSelectedMedia({ url: media.url, type: media.type })}>
                      {media.type === 'image' ? (
                        <img src={media.url} alt="Uploaded media" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <>
                          <video src={media.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/80 rounded-full p-2 text-orange-600 shadow-lg">
                              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        </>
                      )}
                      {isAdmin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteMedia(media.id); }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-gray-400">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <p className="text-sm">No {activeMediaTab === 'image' ? 'photos' : 'videos'} yet in this folder.</p>
                  <p className="text-xs mt-1">Click the + {activeMediaTab === 'image' ? 'Photo' : 'Video'} button above to add.</p>
                </div>
              )}
            </div>
          </div>

          {/* Spiritual Leaders Section - Hidden for Common and Darshan */}
          {!['common', 'darshan'].includes(id) && (
          <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl shadow-md border border-orange-100 h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-orange-800 border-b border-orange-200 pb-3">
              {t('spiritual_leaders')}
            </h3>
            <div className="space-y-3 overflow-y-auto pr-1 flex-grow">
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-orange-50 hover:shadow transition-shadow">
                <img 
                  src="/guruji.jpg" 
                  alt="Guruji" 
                  className="w-14 h-14 rounded-full object-cover shadow border-2 border-orange-200 cursor-pointer hover:scale-105 transition-transform duration-200" 
                  onClick={() => setSelectedMedia({ url: '/guruji.jpg', type: 'image' })}
                />
                <div className="ml-4">
                  <h4 className="font-bold text-md text-gray-800">{t('guruji')}</h4>
                  <p className="text-orange-600 font-medium text-xs">{t('guruji_name')}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-orange-50 hover:shadow transition-shadow">
                <img 
                  src="/guruji_parampara.jpg" 
                  alt="Guruji Parampara" 
                  className="w-14 h-14 rounded-full object-cover shadow border-2 border-orange-200 cursor-pointer hover:scale-105 transition-transform duration-200" 
                  onClick={() => setSelectedMedia({ url: '/guruji_parampara.jpg', type: 'image' })}
                />
                <div className="ml-4">
                  <h4 className="font-bold text-md text-gray-800">{t('guruji_parampara')}</h4>
                  <p className="text-orange-600 font-medium text-xs">{t('guruji_parampara_desc')}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-orange-50 hover:shadow transition-shadow">
                <img 
                  src="/harikrishna_maharaj.jpg" 
                  alt="Harikrishna Maharaj" 
                  className="w-14 h-14 rounded-full object-cover shadow border-2 border-orange-200 cursor-pointer hover:scale-105 transition-transform duration-200" 
                  onClick={() => setSelectedMedia({ url: '/harikrishna_maharaj.jpg', type: 'image' })}
                />
                <div className="ml-4">
                  <h4 className="font-bold text-md text-gray-800">{t('harikrishna_maharaj')}</h4>
                  <p className="text-orange-600 font-medium text-xs">{t('harikrishna_maharaj_desc')}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-orange-50 hover:shadow transition-shadow">
                <img 
                  src="/saint.jpg" 
                  alt="Saint" 
                  className="w-14 h-14 rounded-full object-cover shadow border-2 border-orange-200 cursor-pointer hover:scale-105 transition-transform duration-200" 
                  onClick={() => setSelectedMedia({ url: '/saint.jpg', type: 'image' })}
                />
                <div className="ml-4">
                  <h4 className="font-bold text-md text-gray-800">{t('saint')}</h4>
                  <p className="text-orange-600 font-medium text-xs">{t('saint_desc')}</p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
        {/* Conditional Sections - Hidden for Common and Darshan AND Non-Admins */}
        {!['common', 'darshan'].includes(id) && isAdmin && (
          <>
            {/* Forms Section with Tabs */}
            <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 border-b border-gray-200">
               <button 
                  onClick={() => setActiveAdminTab('receipt')} 
                  className={`cursor-pointer px-4 py-2 rounded-t-lg font-bold transition-colors ${activeAdminTab === 'receipt' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
               >{t('donation_receipt')}</button>
               <button 
                  onClick={() => setActiveAdminTab('padhramani')} 
                  className={`cursor-pointer px-4 py-2 rounded-t-lg font-bold transition-colors ${activeAdminTab === 'padhramani' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
               >{t('padhramani_tab')}</button>
               <button 
                  onClick={() => setActiveAdminTab('atmiya')} 
                  className={`cursor-pointer px-4 py-2 rounded-t-lg font-bold transition-colors ${activeAdminTab === 'atmiya' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
               >
                  {t('atmiya_sabha')}
               </button>
               <button 
                  onClick={() => setActiveAdminTab('yuvti')} 
                  className={`cursor-pointer px-4 py-2 rounded-t-lg font-bold transition-colors ${activeAdminTab === 'yuvti' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
               >
                  {t('yuvti_sabha')}
               </button>
               <button 
                  onClick={() => setActiveAdminTab('announcement')} 
                  className={`cursor-pointer px-4 py-2 rounded-t-lg font-bold transition-colors ${activeAdminTab === 'announcement' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
               >
                  {t('sabha_announcement')}
               </button>
            </div>

            <div className="mb-12 max-w-2xl mx-auto">
              {/* Padhramani Form Section */}
              {isAdmin && activeAdminTab === 'padhramani' && (
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5 text-5xl">🏠</div>
                <h3 className="text-xl font-bold mb-4 text-purple-700 relative z-10">{t('padhramani_request')}</h3>
                <form onSubmit={handlePadhramaniSubmit} className="space-y-4 relative z-10 text-sm">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('name')} *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('phone')} *</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
                      value={pPhone}
                      onChange={(e) => setPPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('address')} *</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all resize-none" 
                      rows="2"
                      value={pAddress}
                      onChange={(e) => setPAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('purpose')} *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
                      value={pHetu}
                      onChange={(e) => setPHetu(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-bold text-base mt-2">
                    {t('submit_request')}
                  </button>
                </form>
              </div>
              )}

              {/* Donation Form Section */}
              {isAdmin && activeAdminTab === 'receipt' && (
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5 text-5xl">₹</div>
                <h3 className="text-xl font-bold mb-4 text-orange-700 relative z-10">{t('devotees_donate')}</h3>
                <form onSubmit={handleDonation} className="space-y-4 relative z-10 text-sm">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('name')} *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all" 
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('phone')}</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('address')}</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all resize-none" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows="1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('amount')} *</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all text-green-700 font-bold" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">{t('purpose')}</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all" 
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={isGenerating} className={`w-full text-white py-2 px-4 rounded-lg shadow transform transition-all duration-200 font-bold text-base mt-2 ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-md hover:-translate-y-0.5'}`}>
                    {isGenerating ? 'Generating...' : t('Donate')}
                  </button>
                </form>
              </div>
              )}

              {/* Atmiya Sabha Form Section */}
              {activeAdminTab === 'atmiya' && (
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 relative overflow-hidden mb-8">
                <h3 className="text-xl font-bold mb-4 text-blue-700 relative z-10">{t('sabha_attendance_title')}</h3>
                
                <form onSubmit={handleAddMember} className="flex space-x-2 mb-6">
                  <input type="text" placeholder={t("name_placeholder")} className="flex-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 w-1/2" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} required />
                  <input type="text" placeholder={t("no_placeholder")} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 w-1/4 uppercase" value={newMemberNumber} onChange={(e) => setNewMemberNumber(e.target.value.toUpperCase())} required />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 w-1/4">{t('add_btn')}</button>
                </form>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-800">{t('todays_attendance')} ({currentDate})</h4>
                    <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">{t('total_present')}: {todayAttendance.length} / {mahilaMembers.length}</span>
                  </div>
                  
                  <div className="mb-3">
                     <input type="text" placeholder={t("search_attendance")} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {mahilaMembers.filter(m => memberSearch === '' || (m.name || "").toLowerCase().includes(memberSearch.toLowerCase()) || (m.hajariNumber && m.hajariNumber.toLowerCase().includes(memberSearch.toLowerCase()))).map(member => (
                      <div key={member.id} className="flex justify-between items-center p-2 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors">
                        <label className="flex items-center space-x-3 cursor-pointer flex-1">
                          <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" checked={todayAttendance.includes(member.id)} onChange={() => handleToggleAttendance(member.id)} />
                          <span className={`font-medium ${todayAttendance.includes(member.id) ? 'text-blue-800' : 'text-gray-600'}`}>
                            <span className="font-bold text-blue-600 mr-2">{member.hajariNumber}</span> {member.name}
                          </span>
                        </label>
                        <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700 ml-4 p-1 rounded-full hover:bg-red-50" title="Delete Member">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                      </div>
                    ))}
                    {mahilaMembers.length === 0 && <p className="text-gray-500 text-sm text-center py-4">{t('no_members_added')}</p>}
                  </div>
                </div>
              </div>
              )}
              {/* Yuvti Sabha Form Section */}
              {activeAdminTab === 'yuvti' && (
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-pink-500 relative overflow-hidden mb-8">
                <h3 className="text-xl font-bold mb-4 text-pink-700 relative z-10">{t('yuvti_sabha_attendance_title')}</h3>
                
                <form onSubmit={handleAddYuvti} className="flex space-x-2 mb-6">
                  <input type="text" placeholder={t("yuvti_name_placeholder")} className="flex-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-500 w-1/2" value={newYuvtiName} onChange={(e) => setNewYuvtiName(e.target.value)} required />
                  <input type="text" placeholder={t("yuvti_no_placeholder")} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-500 w-1/4 uppercase" value={newYuvtiNumber} onChange={(e) => setNewYuvtiNumber(e.target.value.toUpperCase())} required />
                  <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-700 w-1/4">{t('add_btn')}</button>
                </form>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-800">{t('todays_attendance')} ({currentDate})</h4>
                    <span className="bg-pink-100 text-pink-800 font-bold px-3 py-1 rounded-full text-sm">{t('total_present')}: {todayYuvtiAttendance.length} / {yuvtiMembers.length}</span>
                  </div>
                  
                  <div className="mb-3">
                     <input type="text" placeholder={t("yuvti_search_attendance")} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500" value={yuvtiSearch} onChange={(e) => setYuvtiSearch(e.target.value)} />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {yuvtiMembers.filter(m => yuvtiSearch === '' || (m.name || "").toLowerCase().includes(yuvtiSearch.toLowerCase()) || (m.hajariNumber && m.hajariNumber.toLowerCase().includes(yuvtiSearch.toLowerCase()))).map(member => (
                      <div key={member.id} className="flex justify-between items-center p-2 hover:bg-pink-50 rounded-lg border border-transparent hover:border-pink-100 transition-colors">
                        <label className="flex items-center space-x-3 cursor-pointer flex-1">
                          <input type="checkbox" className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 cursor-pointer" checked={todayYuvtiAttendance.includes(member.id)} onChange={() => handleToggleYuvtiAttendance(member.id)} />
                          <span className={`font-medium ${todayYuvtiAttendance.includes(member.id) ? 'text-pink-800' : 'text-gray-600'}`}>
                            <span className="font-bold text-pink-600 mr-2">{member.hajariNumber}</span> {member.name}
                          </span>
                        </label>
                        <button onClick={() => handleDeleteYuvti(member.id)} className="text-red-500 hover:text-red-700 ml-4 p-1 rounded-full hover:bg-red-50" title="Delete Yuvti">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                      </div>
                    ))}
                    {yuvtiMembers.length === 0 && <p className="text-gray-500 text-sm text-center py-4">{t('no_yuvtis_added')}</p>}
                  </div>
                </div>
              </div>
              )}

              {/* Sabha Announcement Form */}
              {activeAdminTab === 'announcement' && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5 text-5xl">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-6 border-b pb-2">{t('sabha_announcement')}</h2>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    // Format the date to include the day of the week
                    const dateVal = e.target.dateDay.value;
                    let formattedDateDay = dateVal;
                    if (dateVal) {
                      const dateObj = new Date(dateVal);
                      const day = String(dateObj.getDate()).padStart(2, '0');
                      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const year = dateObj.getFullYear();
                      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                      formattedDateDay = `${day}-${month}-${year}, ${weekday}`;
                    }

                    const newAnn = {
                      dateDay: formattedDateDay,
                      tithi: e.target.tithi.value,
                      loc: e.target.loc.value,
                      vakta: e.target.vakta.value,
                      food: e.target.food.value,
                      branchId: id,
                      timestamp: Date.now()
                    };
                    const docRef = await addDoc(collection(db, 'sabha_announcements'), newAnn);
                    setSabhaAnnouncements([{ id: docRef.id, ...newAnn }, ...sabhaAnnouncements]);
                    e.target.reset();
                    alert("Announcement added successfully!");
                  } catch (err) {
                    console.error(err);
                    alert("Error adding announcement");
                  }
                }} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">{t('sabha_date_day')} *</label>
                      <input name="dateDay" type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">{t('sabha_tithi')} *</label>
                      <input name="tithi" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">{t('sabha_loc')} *</label>
                      <input name="loc" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">{t('sabha_vakta')} *</label>
                      <input name="vakta" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-1">{t('sabha_food')} *</label>
                      <input name="food" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500" required />
                    </div>
                  </div>
                  <button type="submit" className="cursor-pointer w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg shadow hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-bold text-base mt-2">
                    {t('announce_btn')}
                  </button>
                </form>
              </div>
              )}
            </div>

            </>
          )}



            {!['common', 'darshan'].includes(id) && (
              <>
            {/* Public/Table Tabs Section */}
            {!isAdmin && (
              <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 border-b border-gray-200 justify-center">
                 <button 
                    onClick={() => setActiveAdminTab('announcement')} 
                    className={`cursor-pointer px-4 py-2 rounded-lg font-bold transition-colors ${activeAdminTab === 'announcement' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                 >
                    {t('sabha_announcement')}
                 </button>
                 <button 
                    onClick={() => setActiveAdminTab('atmiya')} 
                    className={`cursor-pointer px-4 py-2 rounded-lg font-bold transition-colors ${activeAdminTab === 'atmiya' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                 >
                    {t('atmiya_sabha')}
                 </button>
                 <button 
                    onClick={() => setActiveAdminTab('yuvti')} 
                    className={`cursor-pointer px-4 py-2 rounded-lg font-bold transition-colors ${activeAdminTab === 'yuvti' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                 >
                    {t('yuvti_sabha')}
                 </button>
              </div>
            )}
            
            {/* History Tables Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Yuvti Sabha Table */}
              {activeAdminTab === 'yuvti' && (
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col xl:col-span-2">
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-xl font-bold text-pink-700">Today's {t('yuvti_sabha_attendance_title')}</h3>
                    <h3 className="text-lg font-bold text-green-700">{t('total_present')}: {todayYuvtiAttendance.length}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {yuvtiMembers.filter(m => todayYuvtiAttendance.includes(m.id)).map((member, index) => (
                      <div key={member.id} className="flex items-center space-x-2 bg-pink-50 p-3 rounded-lg border border-pink-100">
                        <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm">{index + 1}</div>
                        <div className="flex flex-col leading-tight">
                           <span className="font-bold text-pink-600 text-xs">{member.hajariNumber}</span>
                           <span className="font-bold text-pink-900">{member.name}</span>
                        </div>
                      </div>
                    ))}
                    {todayYuvtiAttendance.length === 0 && <p className="text-gray-500 text-sm col-span-3">{t('no_yuvtis_present')}</p>}
                  </div>
                </div>
              )}
              
              {/* Public Sabha Announcements (Visible to all) */}
          {activeAdminTab === 'announcement' && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                 <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-2"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></span>
                 {t('sabha_announcement')}
              </h2>
              <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
                <table className="min-w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-green-50 text-green-900 border-b-2 border-green-200">
                      <th className="py-3 px-4 font-bold">{t('sabha_date_day')}</th>
                      <th className="py-3 px-4 font-bold">{t('sabha_tithi')}</th>
                      <th className="py-3 px-4 font-bold">{t('sabha_loc')}</th>
                      <th className="py-3 px-4 font-bold">{t('sabha_vakta')}</th>
                      <th className="py-3 px-4 font-bold">{t('sabha_food')}</th>
                      {isAdmin && <th className="py-3 px-4 font-bold text-center">{t('action')}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {translatedAnnouncements.map((ann) => (
                      <tr key={ann.id} className="hover:bg-green-50/30 border-b border-gray-100 transition-colors">
                        <td className="py-3 px-4 text-gray-800 font-semibold">{ann.dateDay}</td>
                        <td className="py-3 px-4 text-purple-700 font-semibold">{ann.tithi}</td>
                        <td className="py-3 px-4 text-gray-600">{ann.loc}</td>
                        <td className="py-3 px-4 text-gray-800 font-bold">{ann.vakta}</td>
                        <td className="py-3 px-4 text-orange-600 font-bold">{ann.food}</td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-center">
                             <button onClick={async () => {
                               if(window.confirm('Are you sure you want to delete this announcement?')) {
                                 await deleteDoc(doc(db, 'sabha_announcements', ann.id));
                                 setSabhaAnnouncements(sabhaAnnouncements.filter(a => a.id !== ann.id));
                               }
                             }} className="text-red-500 hover:text-red-700 font-bold text-xs">Delete</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
              
              {/* Padhramani History Table */}
              {isAdmin && activeAdminTab === 'padhramani' && (
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
                  <h3 className="text-xl font-bold mb-4 text-purple-700 border-b pb-2">{t('padhramani_history')}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-purple-50 text-purple-900 border-b-2 border-purple-200">
                          <th className="py-2 px-3 font-semibold">{t('date')}</th>
                          <th className="py-2 px-3 font-semibold">{t('name')}</th>
                          <th className="py-2 px-3 font-semibold">{t('phone')}</th>
                          <th className="py-2 px-3 font-semibold">{t('purpose')}</th>
                          <th className="py-2 px-3 font-semibold text-center">{t('delete') || 'Delete'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPadhramani.map((req) => (
                          <tr key={req.id} className="hover:bg-purple-50/50 border-b border-gray-100 transition-colors">
                            <td className="py-2 px-3 text-gray-500 text-xs whitespace-nowrap">{req.date}</td>
                            <td className="py-2 px-3 font-medium text-gray-800">{req.name}</td>
                            <td className="py-2 px-3 text-gray-600">{req.phone}</td>
                            <td className="py-2 px-3 text-gray-600">{req.hetu}</td>
                            <td className="py-2 px-3 text-center">
                              <button 
                                onClick={() => handleDeletePadhramani(req.id)}
                                className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all duration-200 shadow-sm inline-flex justify-center items-center"
                                title="Delete Padhramani"
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Receipts Table */}
              {isAdmin && activeAdminTab === 'receipt' && (
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
                  <h3 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">{t('receipt_history')}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-blue-50 text-blue-900 border-b-2 border-blue-200">
                          <th className="py-2 px-3 font-semibold">{t('date')}</th>
                          <th className="py-2 px-3 font-semibold">{t('name')}</th>
                          <th className="py-2 px-3 font-semibold">{t('amount')}</th>
                          <th className="py-2 px-3 font-semibold">{t('purpose')}</th>
                          <th className="py-2 px-3 font-semibold text-center">{t('download')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReceipts.map((receipt) => (
                          <tr key={receipt.id} className="hover:bg-blue-50/50 border-b border-gray-100 transition-colors">
                            <td className="py-2 px-3 text-gray-500 text-xs whitespace-nowrap">{receipt.date}</td>
                            <td className="py-2 px-3 font-medium text-gray-800">{receipt.name}</td>
                            <td className="py-2 px-3 font-bold text-emerald-600">₹{receipt.amount}</td>
                            <td className="py-2 px-3 text-gray-600">{receipt.purpose || '-'}</td>
                            <td className="py-2 px-3 text-center flex justify-center space-x-2">
                              <button 
                                onClick={() => handleDownloadOld(receipt)}
                                disabled={isGenerating}
                                className="bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white p-2 rounded-lg transition-all duration-200 shadow-sm"
                                title="Download Receipt"
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="7 10 12 15 17 10"></polyline>
                                  <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteReceipt(receipt.id)}
                                className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all duration-200 shadow-sm"
                                title="Delete Receipt"
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Atmiya Sabha Table */}
              {activeAdminTab === 'atmiya' && (
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col xl:col-span-2">
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-xl font-bold text-blue-700">{t('todays_sabha_attendance')}</h3>
                    <h3 className="text-lg font-bold text-green-700">{t('total_present')}: {todayAttendance.length}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mahilaMembers.filter(m => todayAttendance.includes(m.id)).map((member, index) => (
                      <div key={member.id} className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">{index + 1}</div>
                        <div className="flex flex-col leading-tight">
                           <span className="font-bold text-blue-600 text-xs">{member.hajariNumber}</span>
                           <span className="font-bold text-blue-900">{member.name}</span>
                        </div>
                      </div>
                    ))}
                    {todayAttendance.length === 0 && <p className="text-gray-500 text-sm col-span-3">{t('no_members_present')}</p>}
                  </div>
                </div>
              )}
            </div>
              </>
            )}
      </div>
    </div>
  );
};

export default BranchDetail;