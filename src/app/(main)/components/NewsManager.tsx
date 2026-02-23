"use client";

import { useState, useEffect } from "react";
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Calendar,
  User,
  Clock,
  Tag,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Loader2,
  ChevronDown,
  Star,
  FileText,
} from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: number;
  category: string;
  tags: string[];
  imageUrl: string;
  featured: boolean;
  status: "published" | "draft";
}

const categories = [
  "Benelux News",
  "Results",
  "Club News",
  "Development",
  "Youth",
  "Championships",
  "Announcements",
];

const defaultArticle: Omit<NewsArticle, "id"> = {
  title: "",
  excerpt: "",
  content: "",
  date: new Date().toISOString().split("T")[0],
  author: "",
  readTime: 3,
  category: "Benelux News",
  tags: [],
  imageUrl: "",
  featured: false,
  status: "draft",
};

export default function NewsManager() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<
    Omit<NewsArticle, "id"> & { id?: string }
  >(defaultArticle);
  const [tagInput, setTagInput] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/benelux-news?status=all");
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveArticle() {
    setSaving(true);
    try {
      const method = currentArticle.id ? "PUT" : "POST";
      const res = await fetch("/api/benelux-news", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentArticle),
      });

      if (res.ok) {
        await fetchArticles();
        setIsEditing(false);
        setCurrentArticle(defaultArticle);
      }
    } catch (error) {
      console.error("Failed to save article:", error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      await fetch(`/api/benelux-news?id=${id}`, { method: "DELETE" });
      await fetchArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  }

  async function toggleStatus(article: NewsArticle) {
    try {
      await fetch("/api/benelux-news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          status: article.status === "published" ? "draft" : "published",
        }),
      });
      await fetchArticles();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  }

  function editArticle(article: NewsArticle) {
    setCurrentArticle(article);
    setIsEditing(true);
  }

  function createNewArticle() {
    setCurrentArticle(defaultArticle);
    setIsEditing(true);
  }

  function addTag() {
    if (tagInput.trim() && !currentArticle.tags.includes(tagInput.trim())) {
      setCurrentArticle({
        ...currentArticle,
        tags: [...currentArticle.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setCurrentArticle({
      ...currentArticle,
      tags: currentArticle.tags.filter((t) => t !== tag),
    });
  }

  function formatToolbar(command: string) {
    const textarea = document.getElementById(
      "content-editor"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentArticle.content.substring(start, end);
    let newText = "";

    switch (command) {
      case "bold":
        newText = `**${selectedText}**`;
        break;
      case "italic":
        newText = `*${selectedText}*`;
        break;
      case "list":
        newText = selectedText
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n");
        break;
      case "link":
        const url = prompt("Enter URL:");
        if (url) newText = `[${selectedText || "link text"}](${url})`;
        break;
      default:
        return;
    }

    if (newText) {
      const newContent =
        currentArticle.content.substring(0, start) +
        newText +
        currentArticle.content.substring(end);
      setCurrentArticle({ ...currentArticle, content: newContent });
    }
  }

  const filteredArticles = articles.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-100 overflow-auto">
        {/* Editor Header - Fixed */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setCurrentArticle(defaultArticle);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {currentArticle.id ? "Edit Article" : "New Article"}
              </h3>
              <p className="text-white/70 text-sm">WordPress-style editor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveArticle}
              disabled={saving || !currentArticle.title}
              className="flex items-center gap-2 px-5 py-2 bg-white text-[#1a3a4a] rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {currentArticle.status === "published"
                ? "Save Changes"
                : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setCurrentArticle(defaultArticle);
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close editor"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-4 bg-white rounded-xl p-6 shadow-sm">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={currentArticle.title}
                  onChange={(e) =>
                    setCurrentArticle({
                      ...currentArticle,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter article title..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent text-lg"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt / Summary
                </label>
                <textarea
                  value={currentArticle.excerpt}
                  onChange={(e) =>
                    setCurrentArticle({
                      ...currentArticle,
                      excerpt: e.target.value,
                    })
                  }
                  placeholder="Brief summary that appears in article previews..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent resize-none"
                />
              </div>

              {/* Content Editor with Toolbar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Formatting Toolbar */}
                  <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => formatToolbar("bold")}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatToolbar("italic")}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => formatToolbar("list")}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Bullet List"
                    >
                      <List size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatToolbar("link")}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Insert Link"
                    >
                      <LinkIcon size={16} />
                    </button>
                    <div className="flex-1" />
                    <span className="text-xs text-gray-400">
                      Markdown supported
                    </span>
                  </div>
                  <textarea
                    id="content-editor"
                    value={currentArticle.content}
                    onChange={(e) =>
                      setCurrentArticle({
                        ...currentArticle,
                        content: e.target.value,
                      })
                    }
                    placeholder="Write your article content here... Use Markdown for formatting."
                    rows={12}
                    className="w-full px-4 py-3 focus:outline-none resize-none font-mono text-sm"
                  />
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentArticle(defaultArticle);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  {currentArticle.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentArticle({
                          ...currentArticle,
                          status: "published",
                        });
                        setTimeout(saveArticle, 100);
                      }}
                      disabled={saving || !currentArticle.title}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Eye size={16} />
                      )}
                      Publish Now
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveArticle}
                    disabled={saving || !currentArticle.title}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#2B9EB3] text-white rounded-lg font-medium hover:bg-[#249DAD] transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {currentArticle.id ? "Save Changes" : "Save Draft"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Publish Box */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye size={16} />
                  Publish
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Status
                    </label>
                    <select
                      value={currentArticle.status}
                      onChange={(e) =>
                        setCurrentArticle({
                          ...currentArticle,
                          status: e.target.value as "published" | "draft",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={currentArticle.date}
                      onChange={(e) =>
                        setCurrentArticle({
                          ...currentArticle,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentArticle.featured}
                      onChange={(e) =>
                        setCurrentArticle({
                          ...currentArticle,
                          featured: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#2B9EB3] rounded"
                    />
                    <span className="text-sm">Featured Article</span>
                    <Star size={14} className="text-amber-500" />
                  </label>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ChevronDown size={16} />
                  Category
                </h4>
                <select
                  value={currentArticle.category}
                  onChange={(e) =>
                    setCurrentArticle({
                      ...currentArticle,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag size={16} />
                  Tags
                </h4>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#2B9EB3]/10 text-[#2B9EB3] rounded text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Author & Read Time */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={16} />
                  Author Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={currentArticle.author}
                      onChange={(e) =>
                        setCurrentArticle({
                          ...currentArticle,
                          author: e.target.value,
                        })
                      }
                      placeholder="Author name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Read Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={currentArticle.readTime}
                      onChange={(e) =>
                        setCurrentArticle({
                          ...currentArticle,
                          readTime: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ImageIcon size={16} />
                  Featured Image
                </h4>
                <input
                  type="text"
                  value={currentArticle.imageUrl}
                  onChange={(e) =>
                    setCurrentArticle({
                      ...currentArticle,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="/images/article-image.jpg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Enter image path or URL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="news"
      className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Newspaper size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              News Management
            </h3>
            <p className="text-white/70 text-sm">
              Create and manage news articles
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={createNewArticle}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#1a3a4a] rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          <Plus size={18} />
          New Article
        </button>
      </div>

      <div className="p-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#1a3a4a] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-2 text-xs opacity-70">
                (
                {f === "all"
                  ? articles.length
                  : articles.filter((a) => a.status === f).length}
                )
              </span>
            </button>
          ))}
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#2B9EB3]" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Newspaper size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No articles found</p>
            <button
              type="button"
              onClick={createNewArticle}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B9EB3] text-white rounded-lg font-medium hover:bg-[#249DAD] transition-colors"
            >
              <Plus size={18} />
              Create your first article
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                {/* Image Preview */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText size={24} className="text-gray-300" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {article.title}
                    </h4>
                    {article.featured && (
                      <Star
                        size={14}
                        className="text-amber-500 flex-shrink-0"
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(article.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {article.author || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {article.readTime}m read
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(article)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={
                      article.status === "published" ? "Unpublish" : "Publish"
                    }
                  >
                    {article.status === "published" ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-green-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => editArticle(article)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} className="text-blue-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteArticle(article.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
