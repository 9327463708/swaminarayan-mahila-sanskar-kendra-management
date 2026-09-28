// All backend API calls in one simple file
const BASE_URL = "http://localhost:8000/api";

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function addDonation(donorName, amount) {
  const res = await fetch(`${BASE_URL}/donations/add/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ donor_name: donorName, amount: amount }),
  });
  return res.json();
}

export async function getDonations() {
  const res = await fetch(`${BASE_URL}/donations/`);
  return res.json();
}

export async function addDevotee(name, mobiles, otherInfo) {
  const res = await fetch(`${BASE_URL}/devotees/add/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name, mobiles: mobiles, other_info: otherInfo }),
  });
  return res.json();
}

export async function getDevotees() {
  const res = await fetch(`${BASE_URL}/devotees/`);
  return res.json();
}

export async function addEvent(eventName, eventDate, eventInfo, eventLocation) {
  const res = await fetch(`${BASE_URL}/events/add/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_name: eventName,
      event_date: eventDate,
      event_info: eventInfo,
      event_location: eventLocation,
    }),
  });
  return res.json();
}

export async function getEvents() {
  const res = await fetch(`${BASE_URL}/events/`);
  return res.json();
}

export async function searchAll(query) {
  const res = await fetch(`${BASE_URL}/search/?q=` + encodeURIComponent(query));
  return res.json();
}
