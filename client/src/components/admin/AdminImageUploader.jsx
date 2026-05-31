import { useCallback, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import http from "../../api/http";
import "../../styles/admin/AdminImageUploader.css";

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

async function getCroppedImageBlob(imageSrc, croppedAreaPixels) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas tidak tersedia.");

  const cropX = Math.max(0, Math.round(croppedAreaPixels.x));
  const cropY = Math.max(0, Math.round(croppedAreaPixels.y));
  const cropW = Math.round(croppedAreaPixels.width);
  const cropH = Math.round(croppedAreaPixels.height);

  canvas.width = cropW;
  canvas.height = cropH;

  ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal membuat file hasil crop."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      0.85
    );
  });
}

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;

  return `https://api.masjidkagawa.com${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export default function AdminImageUploader({
  type = "general",
  label = "Upload Gambar",
  value = "",
  onChange,
  aspect = 16 / 9,
}) {
  const [imageSrc, setImageSrc] = useState("");
  const [fileName, setFileName] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const previewSrc = useMemo(() => normalizeImageUrl(value), [value]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const resetCrop = () => {
    setImageSrc("");
    setFileName("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setMessage("");
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("File harus berupa gambar.");
      return;
    }

    setFileName(file.name);
    setMessage("");

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(String(reader.result || ""));
    };

    reader.onerror = () => {
      setMessage("Gagal membaca file gambar.");
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleCropDone = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setMessage("Silakan pilih area gambar terlebih dahulu.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading...");

      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);

      const formData = new FormData();
      formData.append("image", blob, "cropped.jpg");

      const res = await http.post(`/api/uploads/${type}`, formData, {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });

      const data = res.data;

      if (!data?.imageUrl) {
        throw new Error("Upload berhasil, tetapi URL gambar tidak ditemukan.");
      }

      onChange?.(String(data.imageUrl));
      setMessage("Upload berhasil");
      resetCrop();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      const errorMessage =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Upload gagal";

      setMessage(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange?.("");
    resetCrop();
  };

  return (
    <div className="admin-image-uploader">
      <div className="admin-image-uploader__top">
        <label>{label}</label>

        {value && (
          <button type="button" onClick={handleRemove}>
            Hapus gambar
          </button>
        )}
      </div>

      {!imageSrc && (
        <label className="admin-image-uploader__file">
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
      )}

      {imageSrc && (
        <div className="admin-image-uploader__crop-panel">
          <div className="admin-image-uploader__crop-box">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="admin-image-uploader__crop-controls">
            <label>
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>

            <p className="admin-image-uploader__message">File: {fileName}</p>

            <div className="admin-image-uploader__actions">
              <button
                type="button"
                className="admin-image-uploader__upload"
                onClick={handleCropDone}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Crop & Upload"}
              </button>

              <button
                type="button"
                className="admin-image-uploader__cancel"
                onClick={resetCrop}
                disabled={uploading}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {previewSrc && !imageSrc && (
        <div className="admin-image-uploader__preview">
          <img src={previewSrc} alt="Preview" />
        </div>
      )}

      {message && <p className="admin-image-uploader__message">{message}</p>}
    </div>
  );
}