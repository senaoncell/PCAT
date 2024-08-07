const Photo = require('../models/Photo');
const fs = require('node:fs');
const path = require('node:path');

exports.getAllPhotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Sayfa numarasını sayıya dönüştür
    const photosPerPage = 3; // Her sayfada bulunan fotoğraf sayısı

    const totalPhotos = await Photo.countDocuments(); // Toplam fotoğraf sayısı

    const photos = await Photo.find({})
      .sort("-dateCreated")
      .skip((page - 1) * photosPerPage)
      .limit(photosPerPage);

    res.render("index", {
      photos: photos,
      current: page,
      pages: Math.ceil(totalPhotos / photosPerPage),
    });
  } catch (error) {
    res.status(500).send("Bir hata oluştu: " + error.message);
  }
};

exports.getPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).send("Fotoğraf bulunamadı");
    }
    res.render("photo", { photo });
  } catch (error) {
    res.status(500).send("Bir hata oluştu: " + error.message);
  }
};

exports.createPhoto = async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, "../public/uploads");

    fs.mkdir(uploadDir, { recursive: true }, async (err) => {
      if (err) {
        return res.status(500).send("Dizin oluşturma hatası: " + err.message);
      }

      let uploadedImage = req.files.image;
      let uploadPath = path.join(uploadDir, uploadedImage.name);

      uploadedImage.mv(uploadPath, async (err) => {
        if (err) {
          return res.status(500).send("Dosya yükleme hatası: " + err.message);
        }

        try {
          await Photo.create({
            ...req.body,
            image: "/uploads/" + uploadedImage.name,
          });
          res.redirect("/");
        } catch (error) {
          res.status(500).send("Fotoğraf oluşturma hatası: " + error.message);
        }
      });
    });
  } catch (error) {
    res.status(500).send("Bir hata oluştu: " + error.message);
  }
};

exports.updatePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).send("Fotoğraf bulunamadı");
    }
    photo.title = req.body.title;
    photo.description = req.body.description;
    await photo.save();

    res.redirect(`/photos/${req.params.id}`);
  } catch (error) {
    res.status(500).send("Bir hata oluştu: " + error.message);
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).send("Fotoğraf bulunamadı");
    }

    let deletedImage = path.join(__dirname, "../public" + photo.image);
    fs.unlink(deletedImage, (err) => {
      if (err) {
        return res.status(500).send("Dosya silme hatası: " + err.message);
      }
    });

    await Photo.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Bir hata oluştu: " + error.message);
  }
};
