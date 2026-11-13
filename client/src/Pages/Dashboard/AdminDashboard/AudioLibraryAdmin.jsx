import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import {
  uploadFilesToBackend,
  validateFile,
  DEFAULT_ALLOWED_AUDIO_TYPES,
  DEFAULT_ALLOWED_IMAGE_TYPES,
  DEFAULT_MAX_UPLOAD_SIZE,
} from "../../../utils/uploadMedia";

const TYPES = ["tilawah", "surah", "juzz", "maqamat"];
const TYPE_LABELS = { tilawah: "Tilawah", surah: "Surah", juzz: "Juzz", maqamat: "Maqamat" };
const TYPE_ICONS = { tilawah: "📖", surah: "📕", juzz: "📚", maqamat: "🎵" };

const AUDIO_MAX = 200 * 1024 * 1024;

const apiError = (err, fallback = "Request failed") =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.response?.data?.msg ||
  err?.message ||
  fallback;

const AudioLibraryAdmin = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories");

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [catType, setCatType] = useState("tilawah");
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catImageFile, setCatImageFile] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);

  // Audio state
  const [audios, setAudios] = useState([]);
  const [audiosError, setAudiosError] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [audioDesc, setAudioDesc] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioThumb, setAudioThumb] = useState("");
  const [audioThumbFile, setAudioThumbFile] = useState(null);
  const [audioCategoryId, setAudioCategoryId] = useState("");
  const [audioReciter, setAudioReciter] = useState("");
  const [audioDuration, setAudioDuration] = useState("");
  const [editingAudio, setEditingAudio] = useState(null);
  const [audioFilter, setAudioFilter] = useState("");
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchCategories = useCallback(async () => {
    setCategoriesError("");
    try {
      const { data } = await axiosSecure.get("/api/audio/categories");
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setCategories(list);
    } catch (err) {
      setCategories([]);
      setCategoriesError(apiError(err, "Could not load categories"));
    }
  }, [axiosSecure]);

  const fetchAudios = useCallback(async () => {
    setAudiosError("");
    try {
      const params = audioFilter ? `?categoryId=${audioFilter}&admin=true` : "?admin=true";
      const { data } = await axiosSecure.get(`/api/audio${params}`);
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setAudios(list);
    } catch (err) {
      setAudios([]);
      setAudiosError(apiError(err, "Could not load audios"));
    }
  }, [axiosSecure, audioFilter]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchAudios()]).finally(() => setLoading(false));
  }, [fetchCategories, fetchAudios]);

  // ─── Category CRUD ───
  const saveCategory = async () => {
    if (!catName.trim()) return Swal.fire("Error", "Name required", "error");
    try {
      setUploadingCatImage(true);
      let imageUrl = catImage;

      if (catImageFile) {
        validateFile(catImageFile, {
          allowedTypes: DEFAULT_ALLOWED_IMAGE_TYPES,
          maxSize: DEFAULT_MAX_UPLOAD_SIZE,
        });
        const uploaded = await uploadFilesToBackend({
          files: [catImageFile],
          folder: "audio/categories",
          resourceType: "image",
        });
        imageUrl = uploaded?.url || uploaded?.secureUrl || "";
        setCatImage(imageUrl);
      }

      if (editingCat) {
        await axiosSecure.put(`/api/audio/categories/${editingCat._id}`, {
          name: catName.trim(), type: catType, image: imageUrl,
        });
        Swal.fire("Updated", "Category updated", "success");
      } else {
        await axiosSecure.post("/api/audio/categories", {
          name: catName.trim(), type: catType, image: imageUrl,
        });
        Swal.fire("Created", "Category created", "success");
      }
      resetCatForm();
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", apiError(err, "Could not save category"), "error");
    } finally {
      setUploadingCatImage(false);
    }
  };

  const deleteCategory = async (id) => {
    const { isConfirmed } = await Swal.fire({ title: "Delete category?", showCancelButton: true, confirmButtonColor: "#d33" });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/api/audio/categories/${id}`);
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", apiError(err, "Could not delete category"), "error");
    }
  };

  const resetCatForm = () => {
    setCatName(""); setCatImage(""); setCatImageFile(null);
    setCatType("tilawah"); setEditingCat(null);
  };

  // ─── Audio CRUD ───
  const saveAudio = async () => {
    if (!audioTitle.trim() || !audioCategoryId) {
      return Swal.fire("Error", "Title and Category are required", "error");
    }
    if (!audioUrl.trim() && !audioFile) {
      return Swal.fire("Error", "Provide an audio file or an audio URL", "error");
    }

    try {
      setUploadingAudio(true);
      setUploadProgress(0);

      let finalAudioUrl = audioUrl.trim();
      let finalThumb = audioThumb.trim();

      if (audioFile) {
        validateFile(audioFile, {
          allowedTypes: DEFAULT_ALLOWED_AUDIO_TYPES,
          maxSize: AUDIO_MAX,
        });
        const uploaded = await uploadFilesToBackend({
          files: [audioFile],
          folder: "audio/files",
          resourceType: "audio",
          onProgress: setUploadProgress,
        });
        finalAudioUrl = uploaded?.url || uploaded?.secureUrl || "";
        setAudioUrl(finalAudioUrl);
      }

      if (audioThumbFile) {
        validateFile(audioThumbFile, {
          allowedTypes: DEFAULT_ALLOWED_IMAGE_TYPES,
          maxSize: DEFAULT_MAX_UPLOAD_SIZE,
        });
        const uploaded = await uploadFilesToBackend({
          files: [audioThumbFile],
          folder: "audio/thumbnails",
          resourceType: "image",
        });
        finalThumb = uploaded?.url || uploaded?.secureUrl || "";
        setAudioThumb(finalThumb);
      }

      const payload = {
        title: audioTitle.trim(), description: audioDesc.trim(), audioUrl: finalAudioUrl,
        thumbnail: finalThumb, categoryId: audioCategoryId, reciter: audioReciter.trim(),
        duration: Number(audioDuration) || 0,
      };

      if (editingAudio) {
        await axiosSecure.put(`/api/audio/${editingAudio._id}`, payload);
        Swal.fire("Updated", "Audio updated", "success");
      } else {
        await axiosSecure.post("/api/audio", payload);
        Swal.fire("Created", "Audio created", "success");
      }
      resetAudioForm();
      fetchAudios();
    } catch (err) {
      Swal.fire("Error", apiError(err, "Could not save audio"), "error");
    } finally {
      setUploadingAudio(false);
      setUploadProgress(0);
    }
  };

  const deleteAudio = async (id) => {
    const { isConfirmed } = await Swal.fire({ title: "Delete audio?", showCancelButton: true, confirmButtonColor: "#d33" });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/api/audio/${id}`);
      fetchAudios();
    } catch (err) {
      Swal.fire("Error", apiError(err, "Could not delete audio"), "error");
    }
  };

  const resetAudioForm = () => {
    setAudioTitle(""); setAudioDesc(""); setAudioUrl(""); setAudioFile(null);
    setAudioThumb(""); setAudioThumbFile(null);
    setAudioCategoryId(""); setAudioReciter(""); setAudioDuration(""); setEditingAudio(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Audio Library Management</h1>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button className={`tab ${activeTab === "categories" ? "tab-active" : ""}`} onClick={() => setActiveTab("categories")}>Categories</button>
        <button className={`tab ${activeTab === "audios" ? "tab-active" : ""}`} onClick={() => setActiveTab("audios")}>Audios</button>
      </div>

      {/* ─── CATEGORIES TAB ─── */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">{editingCat ? "Edit Category" : "Create Category"}</h2>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Type *</span></label>
                <select className="select select-bordered" value={catType} onChange={(e) => setCatType(e.target.value)}>
                  {TYPES.map((t) => <option key={t} value={t}>{TYPE_ICONS[t]} {TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Name *</span></label>
                <input type="text" className="input input-bordered" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Bayati" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Image File</span></label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setCatImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Or Image URL</span></label>
                <input type="url" className="input input-bordered" value={catImage} onChange={(e) => { setCatImage(e.target.value); setCatImageFile(null); }} placeholder="Optional thumbnail URL" />
                {catImage && !catImageFile && (
                  <img src={catImage} alt="" className="mt-2 h-20 rounded object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button className="btn btn-primary flex-1" onClick={saveCategory} disabled={uploadingCatImage}>
                  {uploadingCatImage ? "Uploading…" : editingCat ? "Update" : "Create"}
                </button>
                {editingCat && <button className="btn btn-ghost" onClick={resetCatForm}>Cancel</button>}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Categories ({categories.length})</h2>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead><tr><th>Type</th><th>Name</th><th>Actions</th></tr></thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id}>
                        <td><span className="badge badge-sm">{TYPE_ICONS[cat.type]} {cat.type}</span></td>
                        <td className="font-medium">{cat.name}</td>
                        <td>
                          <button className="btn btn-xs btn-ghost" onClick={() => { setEditingCat(cat); setCatName(cat.name); setCatType(cat.type); setCatImage(cat.image || ""); setCatImageFile(null); }}>Edit</button>
                          <button className="btn btn-xs btn-error btn-ghost" onClick={() => deleteCategory(cat._id)}>Del</button>
                        </td>
                      </tr>
                    ))}
                    {categoriesError && (
                      <tr>
                        <td colSpan={3} className="text-center py-6">
                          <p className="text-error text-sm">Could not load categories: {categoriesError}</p>
                          <button className="btn btn-xs btn-outline mt-2" onClick={fetchCategories}>Retry</button>
                        </td>
                      </tr>
                    )}
                    {!categoriesError && categories.length === 0 && (
                      <tr><td colSpan={3} className="text-center text-gray-400 py-6">No categories yet. Create one to get started.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AUDIOS TAB ─── */}
      {activeTab === "audios" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">{editingAudio ? "Edit Audio" : "Upload Audio"}</h2>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Category *</span></label>
                <select className="select select-bordered" value={audioCategoryId} onChange={(e) => setAudioCategoryId(e.target.value)}>
                  <option value="">Select category</option>
                  {TYPES.map((t) => (
                    <optgroup key={t} label={`${TYPE_ICONS[t]} ${TYPE_LABELS[t]}`}>
                      {categories.filter((c) => c.type === t).map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Title *</span></label>
                <input type="text" className="input input-bordered" value={audioTitle} onChange={(e) => setAudioTitle(e.target.value)} placeholder="Audio title" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Audio File {editingAudio ? "" : "*"}</span></label>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAudioFile(f);
                    if (f) setAudioUrl("");
                  }}
                />
                <label className="label">
                  <span className="label-text-alt opacity-60">MP3, WAV, OGG, M4A, FLAC, AAC — max 200MB. Uploaded to Cloudinary.</span>
                </label>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Or Audio URL</span></label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={audioUrl}
                  onChange={(e) => { setAudioUrl(e.target.value); if (e.target.value) setAudioFile(null); }}
                  placeholder="https://...mp3"
                  disabled={!!audioFile}
                />
                {audioFile && (
                  <label className="label">
                    <span className="label-text-alt text-emerald-600">File selected: {audioFile.name}</span>
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Reciter</span></label>
                  <input type="text" className="input input-bordered" value={audioReciter} onChange={(e) => setAudioReciter(e.target.value)} placeholder="Reciter name" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Duration (sec)</span></label>
                  <input type="number" className="input input-bordered" value={audioDuration} onChange={(e) => setAudioDuration(e.target.value)} placeholder="120" />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Description</span></label>
                <textarea className="textarea textarea-bordered h-20" value={audioDesc} onChange={(e) => setAudioDesc(e.target.value)} placeholder="Optional description" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Thumbnail File</span></label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAudioThumbFile(f);
                    if (f) setAudioThumb("");
                  }}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Or Thumbnail URL</span></label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={audioThumb}
                  onChange={(e) => { setAudioThumb(e.target.value); if (e.target.value) setAudioThumbFile(null); }}
                  placeholder="Optional thumbnail URL"
                  disabled={!!audioThumbFile}
                />
                {audioThumb && !audioThumbFile && (
                  <img src={audioThumb} alt="" className="mt-2 h-16 w-16 rounded object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
              </div>

              {uploadingAudio && (
                <div className="mt-2">
                  <progress className="progress progress-primary w-full" value={uploadProgress} max="100"></progress>
                  <p className="text-xs text-center mt-1">{uploadProgress}%</p>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button className="btn btn-primary flex-1" onClick={saveAudio} disabled={uploadingAudio}>
                  {uploadingAudio ? "Uploading…" : editingAudio ? "Update" : "Create"}
                </button>
                {editingAudio && <button className="btn btn-ghost" onClick={resetAudioForm}>Cancel</button>}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <h2 className="card-title">Audios ({audios.length})</h2>
                <select className="select select-bordered select-sm" value={audioFilter} onChange={(e) => setAudioFilter(e.target.value)}>
                  <option value="">All categories</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="table table-sm">
                  <thead><tr><th>Title</th><th>Category</th><th>Reciter</th><th>Plays</th><th>Actions</th></tr></thead>
                  <tbody>
                    {audios.map((a) => {
                      const cat = categories.find((c) => c._id === a.categoryId);
                      return (
                        <tr key={a._id}>
                          <td className="font-medium max-w-[150px] truncate">{a.title}</td>
                          <td className="text-xs">{cat?.name || "—"}</td>
                          <td className="text-xs">{a.reciter || "—"}</td>
                          <td className="text-xs">{a.playCount}</td>
                          <td>
                            <button className="btn btn-xs btn-ghost" onClick={() => {
                              setEditingAudio(a); setAudioTitle(a.title); setAudioDesc(a.description || "");
                              setAudioUrl(a.audioUrl); setAudioFile(null); setAudioThumb(a.thumbnail || ""); setAudioThumbFile(null);
                              setAudioCategoryId(a.categoryId);
                              setAudioReciter(a.reciter || ""); setAudioDuration(a.duration || "");
                            }}>Edit</button>
                            <button className="btn btn-xs btn-error btn-ghost" onClick={() => deleteAudio(a._id)}>Del</button>
                          </td>
                        </tr>
                      );
                    })}
                    {audiosError && (
                      <tr>
                        <td colSpan={5} className="text-center py-6">
                          <p className="text-error text-sm">Could not load audios: {audiosError}</p>
                          <button className="btn btn-xs btn-outline mt-2" onClick={fetchAudios}>Retry</button>
                        </td>
                      </tr>
                    )}
                    {!audiosError && audios.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-gray-400 py-6">No audios yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioLibraryAdmin;
