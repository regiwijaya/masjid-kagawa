import Post from "../models/Post.js";

function slugify(text = "") {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generateUniqueSlug(title, excludeId = null) {
  const baseSlug = slugify(title || "artikel") || "artikel";
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await Post.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

// =========================
// PUBLIC
// =========================
export const getPublishedPosts = async (req, res) => {
  try {
    const items = await Post.find({ isPublished: true }).sort({
      isFeatured: -1,
      createdAt: -1,
    });

    return res.json(items);
  } catch (err) {
    console.error("getPublishedPosts ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const item = await Post.findOne({
      slug: req.params.slug,
      isPublished: true,
    });

    if (!item) {
      return res.status(404).json({ msg: "Artikel tidak ditemukan" });
    }

    return res.json(item);
  } catch (err) {
    console.error("getPostBySlug ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// =========================
// ADMIN
// =========================
export const getAllPostsAdmin = async (req, res) => {
  try {
    const items = await Post.find({}).sort({
      createdAt: -1,
    });

    return res.json(items);
  } catch (err) {
    console.error("getAllPostsAdmin ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      imageUrl,
      category,
      author,
      isPublished,
      isFeatured,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ msg: "Judul artikel wajib diisi" });
    }

    const slug = await generateUniqueSlug(title);

    const created = await Post.create({
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || "",
      content: content || "",
      imageUrl: imageUrl?.trim() || "",
      category: category?.trim() || "Artikel",
      author: author?.trim() || "Admin Masjid Kagawa",
      isPublished: typeof isPublished === "boolean" ? isPublished : true,
      isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,
      createdBy: req.admin?._id,
      updatedBy: req.admin?._id,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("createPost ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const current = await Post.findById(req.params.id);

    if (!current) {
      return res.status(404).json({ msg: "Artikel tidak ditemukan" });
    }

    const nextTitle = req.body?.title?.trim() || current.title;
    const nextSlug =
      nextTitle !== current.title
        ? await generateUniqueSlug(nextTitle, current._id)
        : current.slug;

    current.title = nextTitle;
    current.slug = nextSlug;
    current.excerpt =
      typeof req.body?.excerpt === "string" ? req.body.excerpt.trim() : current.excerpt;
    current.content = typeof req.body?.content === "string" ? req.body.content : current.content;
    current.imageUrl =
      typeof req.body?.imageUrl === "string" ? req.body.imageUrl.trim() : current.imageUrl;
    current.category =
      typeof req.body?.category === "string" ? req.body.category.trim() : current.category;
    current.author =
      typeof req.body?.author === "string" ? req.body.author.trim() : current.author;

    if (typeof req.body?.isPublished === "boolean") {
      current.isPublished = req.body.isPublished;
    }

    if (typeof req.body?.isFeatured === "boolean") {
      current.isFeatured = req.body.isFeatured;
    }

    current.updatedBy = req.admin?._id;

    await current.save();

    return res.json(current);
  } catch (err) {
    console.error("updatePost ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Artikel tidak ditemukan" });
    }

    return res.json({ msg: "Artikel berhasil dihapus" });
  } catch (err) {
    console.error("deletePost ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};