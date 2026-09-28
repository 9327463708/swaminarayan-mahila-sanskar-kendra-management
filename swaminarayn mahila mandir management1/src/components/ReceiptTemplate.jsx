import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

const ReceiptTemplate = forwardRef(({ donorDetails, branchName }, ref) => {
  const { t } = useTranslation();
  const receiptNo = donorDetails?.id?.slice(-6) || Math.floor(100000 + Math.random() * 900000);
  const currentDate = donorDetails?.date || new Date().toLocaleDateString('gu-IN');

  return (
    <div 
      ref={ref} 
      style={{
        width: '800px', // Fixed width for A4 proportion (800x1130 roughly)
        minHeight: '1000px',
        padding: '40px',
        backgroundColor: 'white',
        position: 'relative',
        fontFamily: '"Poppins", sans-serif',
        color: '#000'
      }}
    >
      {/* Outer Borders */}
      <div style={{
        position: 'absolute',
        top: '20px', left: '20px', right: '20px', bottom: '20px',
        border: '2px solid #000'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '25px', left: '25px', right: '25px', bottom: '25px',
        border: '1px solid #000'
      }}></div>

      {/* Watermark Logo */}
      <img 
        src="/logo.jpg" 
        alt="Watermark" 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          opacity: 0.1,
          zIndex: 0
        }}
      />

      {/* Content Container (Above watermark) */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '100px', height: '100px', marginRight: '30px' }} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', color: '#e65c00', margin: 0, fontWeight: 'bold' }}>
              {t('swaminarayan_mahila_sanskar_kendra')}
            </h1>
            <p style={{ fontSize: '20px', margin: '5px 0 0 0', fontWeight: 'bold' }}>{t('branch')}: {branchName}</p>
          </div>
        </div>

        {/* Title */}
        <h2 style={{ textAlign: 'center', fontSize: '26px', border: '2px solid #000', display: 'inline-block', padding: '10px 30px', margin: '0 auto 40px auto', borderRadius: '5px', backgroundColor: '#fff8f0', left: '50%', position: 'relative', transform: 'translateX(-50%)' }}>
          {t('receipt_title')}
        </h2>

        {/* Date and Receipt No */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', marginBottom: '40px', fontWeight: 'bold' }}>
          <div>{t('receipt_no')} {receiptNo}</div>
          <div>{t('date')}: {currentDate}</div>
        </div>

        {/* Details Section */}
        <div style={{ fontSize: '22px', lineHeight: '2.5' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>{t('received_from')}</span>
            <span style={{ flexGrow: 1, borderBottom: '1px solid #000', fontWeight: 'bold' }}>{donorDetails?.name}</span>
          </div>
          
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>{t('phone')}:</span>
            <span style={{ flexGrow: 1, borderBottom: '1px solid #000', fontWeight: 'bold' }}>{donorDetails?.mobile}</span>
          </div>

          <div style={{ display: 'flex', marginTop: '10px' }}>
            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>{t('address')}:</span>
            <span style={{ flexGrow: 1, borderBottom: '1px solid #000', fontWeight: 'bold' }}>{donorDetails?.address}</span>
          </div>

          <div style={{ display: 'flex', marginTop: '10px' }}>
            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>{t('sum_rupees')}</span>
            <span style={{ flexGrow: 1, borderBottom: '1px solid #000', fontWeight: 'bold' }}>{donorDetails?.amount} /-</span>
          </div>

          <div style={{ display: 'flex', marginTop: '10px' }}>
            <span style={{ whiteSpace: 'nowrap', marginRight: '15px' }}>{t('purpose')}:</span>
            <span style={{ flexGrow: 1, borderBottom: '1px solid #000', fontWeight: 'bold' }}>{donorDetails?.purpose || t('default_purpose')}</span>
          </div>
        </div>

        {/* Amount Box and Signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e65c00', margin: '0 0 20px 0' }}>{t('jay_swaminarayan')}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '200px', height: '80px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/signature.jpg" alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
});

export default ReceiptTemplate;
