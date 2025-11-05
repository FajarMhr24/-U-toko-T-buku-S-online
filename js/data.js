const users = [
    { email: "admin@example.com", password: "admin123", name: "Admin" },
    { email: "hafizh@example.com", password: "123456", name: "Muhammad Hafizh" }
  ];
  
  const dataKatalogBuku = [
    { id:"B001", judul:"Kepemimpinan", penulis:"D. Nugroho", stok:15, harga:85000,  gambar:"image/kepemimpinan.jpg" },
    { id:"B002", judul:"Manajemen Keuangan", penulis:"S. Amelia", stok:10, harga:99000, gambar:"image/manajemen_keuangan.jpg" },
    { id:"B003", judul:"Mikrobiologi", penulis:"R. Pratama", stok:8,  harga:120000,  gambar:"image/mikrobiologi.jpg" },
    { id:"B004", judul:"Perkembangan Usia Dini", penulis:"N. Aisyah", stok:20, harga:78000,  gambar:"image/paud_perkembangan.jpg" },
    { id:"B005", judul:"Pengantar Komunikasi", penulis:"A. Rahman", stok:25, harga:65000,  gambar:"image/pengantar_komunikasi.jpg" }
  ];
  
  const dataPengiriman = [
    { doNumber:"DO-1001", namaPemesan:"Muhammad Hafizh", status:"Dalam Perjalanan", progres:60, ekspedisi:"JNE REG", tanggalKirim:"2025-11-01", jenisPaket:"Reguler", totalPembayaran:245000 },
    { doNumber:"DO-1002", namaPemesan:"Aisyah",           status:"Dikemas",            progres:30, ekspedisi:"SiCepat",  tanggalKirim:"2025-11-02", jenisPaket:"Best",    totalPembayaran:180000 }
  ];
  
