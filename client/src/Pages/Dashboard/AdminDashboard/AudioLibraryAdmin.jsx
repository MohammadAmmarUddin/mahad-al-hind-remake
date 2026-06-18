import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const TYPES = ["tilawah", "surah", "juzz", "maqamat"];
const TYPE_LABELS = { tilawah: "Tilawah", surah: "Surah", juzz: "Juzz", maqamat: "Maqamat" };
const TYPE_ICONS = { tilawah: "📖", surah: "📕", juzz: "📚", maqamat: "🎵" };

const AudioLibraryAdmin = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories");

  // Categories state
  const [categories, setCategories] = useState([]);
  const [catType, setCatType] = useState("tilawah");
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catParentId, setCatParentId] = useState("");
  const [editingCat, setEditingCat] = useState(null);

  // Audio state
  const [audios, setAudios] = useState([]);
  const [audioTitle, setAudioTitle] = useState("");
  const [audioDesc, setAudioDesc] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioThumb, setAudioThumb] = useState("");
  const [audioCategoryId, setAudioCategoryId] = useState("");
  const [audioReciter, setAudioReciter] = useState("");
  const [audioDuration, setAudioDuration] = useState("");
  const [editingAudio, setEditingAudio] = useState(null);
  const [audioFilter, setAudioFilter] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axiosSecure.get("/api/audio/categories");
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [axiosSecure]);

  const fetchAudios = useCallback(async () => {
    try {
      const params = audioFilter ? `?categoryId=${audioFilter}` : "";
      const { data } = await axiosSecure.get(`/api/audio${params}`);
      setAudios(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [axiosSecure, audioFilter]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchAudios()]).finally(() => setLoading(false));
  }, [fetchCategories, fetchAudios]);

  // ─── Category CRUD ───
  const saveCategory = async () => {
    if (!catName.trim()) return Swal.fire("Error", "Name required", "error");
    try {
      if (editingCat) {
        await axiosSecure.put(`/api/audio/categories/${editingCat._id}`, {
          name: catName.trim(), type: catType, image: catImage, parentId: catParentId || null,
        });
        Swal.fire("Updated", "Category updated", "success");
      } else {
        await axiosSecure.post("/api/audio/categories", {
          name: catName.trim(), type: catType, image: catImage, parentId: catParentId || null,
        });
        Swal.fire("Created", "Category created", "success");
      }
      resetCatForm();
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  const deleteCategory = async (id) => {
    const { isConfirmed } = await Swal.fire({ title: "Delete category?", showCancelButton: true, confirmButtonColor: "#d33" });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/api/audio/categories/${id}`);
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  const resetCatForm = () => {
    setCatName(""); setCatImage(""); setCatParentId(""); setEditingCat(null);
  };

  // ─── Audio CRUD ───
  const saveAudio = async () => {
    if (!audioTitle.trim() || !audioUrl.trim() || !audioCategoryId) {
      return Swal.fire("Error", "Title, URL, and Category are required", "error");
    }
    try {
      const payload = {
        title: audioTitle.trim(), description: audioDesc.trim(), audioUrl: audioUrl.trim(),
        thumbnail: audioThumb.trim(), categoryId: audioCategoryId, reciter: audioReciter.trim(),
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
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  const deleteAudio = async (id) => {
    const { isConfirmed } = await Swal.fire({ title: "Delete audio?", showCancelButton: true, confirmButtonColor: "#d33" });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/api/audio/${id}`);
      fetchAudios();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  const resetAudioForm = () => {
    setAudioTitle(""); setAudioDesc(""); setAudioUrl(""); setAudioThumb("");
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
                <label className="label"><span className="label-text font-semibold">Image URL</span></label>
                <input type="url" className="input input-bordered" value={catImage} onChange={(e) => setCatImage(e.target.value)} placeholder="Optional thumbnail" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Parent Category (optional)</span></label>
                <select className="select select-bordered" value={catParentId} onChange={(e) => setCatParentId(e.target.value)}>
                  <option value="">None (top-level)</option>
                  {categories.filter((c) => c.type === catType && !c.parentId).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="btn btn-primary flex-1" onClick={saveCategory}>{editingCat ? "Update" : "Create"}</button>
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
                  <thead><tr><th>Type</th><th>Name</th><th>Parent</th><th>Actions</th></tr></thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id}>
                        <td><span className="badge badge-sm">{TYPE_ICONS[cat.type]} {cat.type}</span></td>
                        <td className="font-medium">{cat.name}</td>
                        <td className="text-sm text-gray-500">{cat.parentId ? categories.find((c) => c._id === cat.parentId)?.name || "—" : "—"}</td>
                        <td>
                          <button className="btn btn-xs btn-ghost" onClick={() => { setEditingCat(cat); setCatName(cat.name); setCatType(cat.type); setCatImage(cat.image || ""); setCatParentId(cat.parentId || ""); }}>Edit</button>
                          <button className="btn btn-xs btn-error btn-ghost" onClick={() => deleteCategory(cat._id)}>Del</button>
                        </td>
                      </tr>
                    ))}
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
                        <option key={c._id} value={c._id}>{c.parentId ? "  └ " : ""}{c.name}</option>
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
                <label className="label"><span className="label-text font-semibold">Audio URL *</span></label>
                <input type="url" className="input input-bordered" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://...mp3" />
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
                <label className="label"><span className="label-text font-semibold">Thumbnail URL</span></label>
                <input type="url" className="input input-bordered" value={audioThumb} onChange={(e) => setAudioThumb(e.target.value)} placeholder="Optional thumbnail" />
              </div>
              <div className="flex gap-2 mt-2">
                <button className="btn btn-primary flex-1" onClick={saveAudio}>{editingAudio ? "Update" : "Create"}</button>
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
                              setAudioUrl(a.audioUrl); setAudioThumb(a.thumbnail || ""); setAudioCategoryId(a.categoryId);
                              setAudioReciter(a.reciter || ""); setAudioDuration(a.duration || "");
                            }}>Edit</button>
                            <button className="btn btn-xs btn-error btn-ghost" onClick={() => deleteAudio(a._id)}>Del</button>
                          </td>
                        </tr>
                      );
                    })}
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
