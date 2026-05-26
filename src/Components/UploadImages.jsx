import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ImageUpload({ onChange }) {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState([]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
    onChange(files);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="images">{t("imageUpload")} :</label>
      <input
        type="file"
        id="images"
        multiple
        accept="image/*"
        onChange={handleImages}
        className="border rounded px-2 w-fit py-1 cursor-pointer hover:bg-yellow-900/50 duration-200"
      />

      <div className="flex gap-2 flex-wrap">
        {previews.map((src, i) => (
          <img key={i} src={src} className="w-24 h-24 object-cover rounded" />
        ))}
      </div>
    </div>
  );
}