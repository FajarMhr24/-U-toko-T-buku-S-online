function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }
function fmtIDR(n) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n || 0); }

function greetByTime() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 19) return "Selamat Sore";
  return "Selamat Malam";
}

function bindDataGlobals() {
  try { if (typeof users !== "undefined") window.users = users; } catch {}
  try { if (typeof dataKatalogBuku !== "undefined") window.dataKatalogBuku = dataKatalogBuku; } catch {}
  try { if (typeof dataPengiriman !== "undefined") window.dataPengiriman = dataPengiriman; } catch {}
}

const IMG_DIR_PREFERRED = (() => {
  try {
    const g = (window.dataKatalogBuku && window.dataKatalogBuku[0]?.gambar) || "";
    if (g.startsWith("image/")) return "image";
    return "img";
  } catch { return "img"; }
})();

function normalizeImgPath(path) {
  if (!path) return `${IMG_DIR_PREFERRED}/buku1.png`;
  if (path.startsWith("img/") && IMG_DIR_PREFERRED === "image") return path.replace(/^img\//, "image/");
  if (path.startsWith("image/") && IMG_DIR_PREFERRED === "img") return path.replace(/^image\//, "img/");
  return path;
}

function imgWithFallback(src, style = "width:48px;height:48px;object-fit:cover;border-radius:8px") {
  const primary = normalizeImgPath(src || `${IMG_DIR_PREFERRED}/buku1.png`);
  const alt = primary.startsWith("img/") ? primary.replace(/^img\//, "image/") :
              primary.startsWith("image/") ? primary.replace(/^image\//, "img/") :
              `${IMG_DIR_PREFERRED}/buku1.png`;
  return `<img src="${primary}" style="${style}" onerror="this.onerror=null;this.src='${alt}'">`;
}

function openModal(id) { const el = qs(id); if (el) el.classList.add("show"); }
function closeModal(id) { const el = qs(id); if (el) el.classList.remove("show"); }
document.addEventListener("click", (e) => { if (e.target.classList?.contains("modal")) e.target.classList.remove("show"); });


function requireAuth() {
  const isLogin = location.pathname.endsWith("index.html") || location.pathname.endsWith("/") || location.pathname === "";
  if (isLogin) return;
  try {
    const user = JSON.parse(localStorage.getItem("auth_user") || "null");
    if (!user) location.href = "index.html";
  } catch { location.href = "index.html"; }
}
function signOut() { localStorage.removeItem("auth_user"); location.href = "index.html"; }
window.signOut = signOut;

function attachOnce(el, type, handler, key) {
  if (!el || !type || !handler) return;
  const mark = `__once_${key || type}`;
  if (el[mark]) return;
  el.addEventListener(type, handler);
  el[mark] = true;
}

function initLoginPage() {
  const form = qs("#loginForm");
  if (!form) return; 

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const email = qs("#email").value.trim();
    const password = qs("#password").value.trim();

    if (!Array.isArray(window.users)) {
      alert("Gagal memuat data pengguna. Pastikan js/data.js di-load sebelum script.js");
      return;
    }
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) { alert("email/password yang anda masukkan salah"); return; }
    localStorage.setItem("auth_user", JSON.stringify(found));
    location.href = "dashboard.html";
  });

  const forgotForm = qs("#forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const em = qs("#forgotEmail").value.trim();
      if (!em) { alert("Masukkan email."); return; }
      alert("Link reset password telah dikirim (simulasi).");
      closeModal("#modalForgot");
    });
  }

  const regForm = qs("#registerForm");
  if (regForm) {
    regForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const name = qs("#regName").value.trim();
      const em = qs("#regEmail").value.trim();
      const pw = qs("#regPassword").value.trim();
      if (!name || !em || !pw) { alert("Lengkapi semua field!"); return; }

      if (!Array.isArray(window.users)) window.users = [];
      if (users.find(u => u.email === em)) { alert("Email sudah terdaftar."); return; }

      users.push({ email: em, password: pw, name });
      alert("Pendaftaran berhasil. Silakan login.");
      closeModal("#modalRegister");
    });
  }
}

function initDashboardPage() {
  requireAuth();
  const hello = qs("#hello");
  if (!hello) return;

  let name = "Pengguna";
  try { const u = JSON.parse(localStorage.getItem("auth_user") || "null"); if (u?.name) name = u.name; } catch {}
  hello.textContent = `${greetByTime()}, ${name}`;
}

function initStokPage() {
  requireAuth();
  const tbody = qs("#tbody");
  if (!tbody) return;


  if (!Array.isArray(window.dataKatalogBuku)) window.dataKatalogBuku = window.dataKatalogBuku || [];

  function renderTable() {
    tbody.innerHTML = "";
    window.dataKatalogBuku.forEach((b) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.id}</td>
        <td style="display:flex;gap:10px;align-items:center">
          ${imgWithFallback(b.gambar)}
          <div><strong>${b.judul}</strong><br><small class="helper">${b.penulis}</small></div>
        </td>
        <td>${b.stok ?? 0}</td>
        <td>${fmtIDR(b.harga)}</td>`;
      tbody.appendChild(tr);
    });
  }

  const formAdd = qs("#formAdd");
  if (formAdd) {
    formAdd.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const id = qs("#id").value.trim();
      const judul = qs("#judul").value.trim();
      const penulis = qs("#penulis").value.trim();
      const stok = parseInt(qs("#stok").value || "0");
      const harga = parseInt(qs("#harga").value || "0");
      if (!id || !judul || !penulis) { alert("Lengkapi ID/Judul/Penulis"); return; }
      (window.dataKatalogBuku ||= []).push({ id, judul, penulis, stok, harga, gambar: `${IMG_DIR_PREFERRED}/buku1.png` });
      renderTable();
      formAdd.reset();
    });
  }

  renderTable();
}

function initChackoutPage() {
  requireAuth();
  const list = qs("#katalog");
  if (!list) return;

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("cart") || "[]"); } catch { cart = []; }
  function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

  function renderKatalog() {
    list.innerHTML = "";
    (window.dataKatalogBuku || []).forEach((b) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="grid grid-3" style="align-items:center">
          <div style="display:flex;gap:10px;align-items:center">
            ${imgWithFallback(b.gambar, "width:60px;height:60px;object-fit:cover;border-radius:8px")}
            <div>
              <div><strong>${b.judul}</strong></div>
              <div><small class="helper">${b.penulis}</small></div>
              <div class="badge">Stok: ${b.stok}</div>
            </div>
          </div>
          <div>${fmtIDR(b.harga)}</div>
          <div style="text-align:right"><button class="btn" data-add="${b.id}">Tambah</button></div>
        </div>`;
      list.appendChild(card);
    });
  }

  attachOnce(list, "click", (e) => {
    const id = e.target?.dataset?.add;
    if (!id) return;
    const b = (window.dataKatalogBuku || []).find(x => x.id === id);
    if (!b) return;
    const ex = cart.find(x => x.id === id);
    if (ex) ex.qty++; else cart.push({ id: b.id, judul: b.judul, harga: b.harga, qty: 1 });
    saveCart(); renderCart();
  }, "add_handler");

  function renderCart() {
    const tb = qs("#tbodyCart");
    if (!tb) return;
    tb.innerHTML = "";
    let total = 0;
    cart.forEach((it) => {
      const sub = it.harga * it.qty;
      total += sub;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${it.judul}</td>
        <td>${fmtIDR(it.harga)}</td>
        <td>
          <button class="btn outline" data-dec="${it.id}">-</button>
          <span style="padding:0 8px">${it.qty}</span>
          <button class="btn" data-inc="${it.id}">+</button>
        </td>
        <td>${fmtIDR(sub)}</td>`;
      tb.appendChild(tr);
    });
    const totalEl = qs("#total");
    if (totalEl) totalEl.textContent = fmtIDR(total);
  }

  const tbCart = qs("#tbodyCart");
  attachOnce(tbCart, "click", (e) => {
    const inc = e.target?.dataset?.inc;
    const dec = e.target?.dataset?.dec;
    if (inc) { const it = cart.find(x => x.id === inc); if (it) it.qty++; }
    else if (dec) {
      const it = cart.find(x => x.id === dec);
      if (it) { it.qty--; if (it.qty <= 0) cart = cart.filter(x => x.id !== dec); }
    } else return;
    saveCart(); renderCart();
  }, "qty_handler");

  function renderHistory() {
    const wrap = qs("#historyList");
    if (!wrap) return;
    let data = [];
    try { data = JSON.parse(localStorage.getItem("history") || "[]"); } catch { data = []; }
    wrap.innerHTML = "";
    data.slice().reverse().forEach((o) => {
      const d = document.createElement("div");
      d.className = "card";
      d.innerHTML = `<strong>DO: ${o.doNumber}</strong><br>Nama: ${o.nama}<br>Total: ${fmtIDR(o.total)}<br>Waktu: ${new Date(o.waktu).toLocaleString("id-ID")}`;
      wrap.appendChild(d);
    });
  }

  const orderForm = qs("#orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!cart.length) { alert("Keranjang kosong."); return; }
      const nama = qs("#nama").value.trim();
      const alamat = qs("#alamat").value.trim();
      const metode = qs("#metode").value;
      const bayar = qs("#bayar").value.trim();
      if (!nama || !alamat || !bayar) { alert("Lengkapi data pemesan & pembayaran."); return; }

      const doNumber = "DO-" + (1000 + Math.floor(Math.random() * 9000));
      const total = cart.reduce((s, it) => s + it.harga * it.qty, 0);
      const order = { doNumber, nama, alamat, metode, bayar, total, waktu: new Date().toISOString(), items: cart };

      let history = [];
      try { history = JSON.parse(localStorage.getItem("history") || "[]"); } catch { history = []; }
      history.push(order);
      localStorage.setItem("history", JSON.stringify(history));
      localStorage.setItem("last_do", doNumber);

      cart = []; saveCart(); renderCart();
      alert("Pesanan berhasil! Nomor DO: " + doNumber);
      location.hash = "#history";
      renderHistory();
    });
  }

  renderKatalog();
  renderCart();
  renderHistory();
}

function initTrackingPage() {
  requireAuth();
  const form = qs("#formTrack");
  if (!form) return;

  const input = qs("#do");
  if (input) input.value = localStorage.getItem("last_do") || "";

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const no = (qs("#do").value || "").trim() || localStorage.getItem("last_do") || "";
    if (!no) { alert("Masukkan Nomor Delivery Order"); return; }

    let d = (window.dataPengiriman || []).find(x => x.doNumber === no);
    if (!d) {
      let last = null;
      try { last = JSON.parse(localStorage.getItem("history") || "[]").slice(-1)[0] || null; } catch {}
      if (last) {
        d = {
          doNumber: last.doNumber,
          namaPemesan: last.nama,
          status: "Diterima di Gudang",
          progres: 40,
          ekspedisi: "JNT",
          tanggalKirim: new Date().toISOString().slice(0, 10),
          jenisPaket: "Reguler",
          totalPembayaran: last.total
        };
      }
    }
    if (!d) { alert("DO tidak ditemukan."); return; }

    qs("#hasil").innerHTML = `
      <div class="card">
        <div><strong>Nomor DO:</strong> ${d.doNumber}</div>
        <div><strong>Nama Pemesan:</strong> ${d.namaPemesan}</div>
        <div><strong>Status:</strong> ${d.status}</div>
        <div class="progress" style="margin:8px 0"><div style="width:${d.progres}%"></div></div>
        <table class="table" style="margin-top:8px">
          <tbody>
            <tr><td>Ekspedisi</td><td>${d.ekspedisi}</td></tr>
            <tr><td>Tanggal Kirim</td><td>${d.tanggalKirim}</td></tr>
            <tr><td>Jenis Paket</td><td>${d.jenisPaket}</td></tr>
            <tr><td>Total Pembayaran</td><td>${fmtIDR(d.totalPembayaran)}</td></tr>
          </tbody>
        </table>
      </div>`;
  });
}

document.addEventListener("DOMContentLoaded", () => {

  bindDataGlobals();


  initLoginPage();
  initDashboardPage();
  initStokPage();
  initChackoutPage();
  initTrackingPage();
});
