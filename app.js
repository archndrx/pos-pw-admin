const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser'); 

// Inisialisasi Firebase Admin SDK dengan kredensial
const serviceAccount = require('../point-of-sales-f4a2f-firebase-adminsdk-1b55z-eea9969512.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = 3000;
app.use(bodyParser.json());



// Endpoint untuk menghapus pengguna berdasarkan UID
app.post('/signup', async (req, res) => {
  try {
    // Ambil data dari permintaan HTTP
    const { email, password, role, name } = req.body;

    // Mengecek apakah data yang diterima tidak kosong atau tidak null
    if (email && password && role && name) {
      // Jika data valid, lakukan stringify
      const stringifiedData = JSON.stringify({ email, password, role, name });
      const parsedData = JSON.parse(stringifiedData);

      // Membuat pengguna dengan data yang sudah diparse
      const userRecord = await admin.auth().createUser(parsedData);

      // Kirim respons bahwa pengguna berhasil ditambahkan
      res.status(200).json({ message: 'Pengguna berhasil ditambahkan', userId: userRecord.uid });
    } else {
      // Jika data tidak valid, kirim respons error
      res.status(400).json({ error: 'Data tidak lengkap atau tidak valid' });
    }
  } catch (error) {
    console.error('Error menambahkan pengguna:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan pengguna' });
  }
});

app.put('/editUser/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    // Dapatkan data yang diperbarui dari permintaan HTTP
    const { updatedName, updatedEmail, updatedPassword, updatedRole } = req.body;

    // Lakukan validasi atau proses lain yang diperlukan

    // Lakukan pembaruan pada Firebase Auth
    await admin.auth().updateUser(uid, {
      email: updatedEmail,
      password: updatedPassword,
    });

    // Lakukan pembaruan pada Firestore
    await admin.firestore().collection('users').doc(uid).update({
      name: updatedName,
      email: updatedEmail,
      password: updatedPassword,
      role: updatedRole,
    });

    // Kirim respons bahwa pengguna berhasil diubah
    res.status(200).json({ message: 'Pengguna berhasil diubah' });
  } catch (error) {
    console.error('Error mengubah pengguna:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengubah pengguna' });
  }
});



// Endpoint untuk menghapus pengguna berdasarkan UID
app.delete('/deleteUser/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    await admin.auth().deleteUser(uid);
    res.status(200).json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Error menghapus pengguna:', error);
res.status(500).json({ error: `Terjadi kesalahan saat menghapus pengguna: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
