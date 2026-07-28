const quotes = [
  '"Tidur adalah investasi terbaik untuk esok hari."',
  '"Kalau mangkuk kosong, itu darurat nasional."',
  '"Jangan ganggu tidur siangku, itu agenda penting."',
  '"Kardus kosong adalah singgasana."',
  '"Aku tidak malas, aku sedang menghemat energi."',
  '"Dielus itu hak, bukan privilese."',
  '"Setiap sudut rumah adalah milikku."'
];

const quoteEl = document.getElementById('quote');
const btn = document.getElementById('quote-btn');

btn.addEventListener('click', () => {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.textContent = random;
});
