"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InternalLink from "../components/InternalLink";
import { useBasePath } from "../hooks/useBasePath";
import {
  Images,
  FileText,
  Settings,
  LogIn,
  Loader2,
  Lock,
  Instagram,
  Users,
  Plus,
  Trash2,
  X,
  Link,
  Facebook,
  Linkedin,
  Youtube,
  Check,
} from "lucide-react";

const CLUB_ID = "rome-hibernia";

interface ClubSiteAdmin {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
}

const SOCIAL_PLATFORMS = [
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/yourclub",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/yourclub",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/@yourclub",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/company/yourclub",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: Link,
    placeholder: "https://tiktok.com/@yourclub",
  },
] as const;

export default function RomeAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { basePath } = useBasePath();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClubAdmin, setIsClubAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Admin management state
  const [admins, setAdmins] = useState<ClubSiteAdmin[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Social media links state - pre-populate with known links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "https://www.instagram.com/romehiberniagaa/",
    facebook: "https://www.facebook.com/RomeHiberniaGAA/",
    youtube: "",
    linkedin: "",
    tiktok: "",
  });
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [socialSuccess, setSocialSuccess] = useState(false);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    const res = await fetch(`/api/club-site-admins?clubId=${CLUB_ID}`);
    if (res.ok) {
      const data = await res.json();
      setAdmins(data);
    }
  }, [isSuperAdmin]);

  const fetchSocialLinks = useCallback(async () => {
    const res = await fetch(
      `/api/club-content?clubId=${CLUB_ID}&pageKey=settings`
    );
    if (res.ok) {
      const data = await res.json();
      // Start with defaults
      const links: SocialLinks = {
        instagram: "https://www.instagram.com/romehiberniagaa/",
        facebook: "https://www.facebook.com/RomeHiberniaGAA/",
        youtube: "",
        linkedin: "",
        tiktok: "",
      };
      // Only override with database values if they exist and are non-empty
      if (data.content) {
        Object.entries(data.content).forEach(([key, val]) => {
          const platform = key.replace("social_", "") as keyof SocialLinks;
          if (platform in links) {
            const dbValue = (val as { value: string }).value;
            if (dbValue) {
              links[platform] = dbValue;
            }
          }
        });
      }
      setSocialLinks(links);
    }
  }, []);

  const handleSaveSocialLinks = async () => {
    setSavingSocial(true);
    setSocialError("");
    setSocialSuccess(false);

    try {
      const promises = SOCIAL_PLATFORMS.map((platform) =>
        fetch("/api/club-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubId: CLUB_ID,
            pageKey: "settings",
            contentKey: `social_${platform.key}`,
            value: socialLinks[platform.key as keyof SocialLinks],
          }),
        })
      );

      await Promise.all(promises);
      setSocialSuccess(true);
      setTimeout(() => {
        setShowSocialModal(false);
        setSocialSuccess(false);
      }, 1500);
    } catch {
      setSocialError("Failed to save social links");
    } finally {
      setSavingSocial(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      setCheckingAdmin(false);
      return;
    }

    // Check if user is a club site admin
    fetch(`/api/club-site-admins/check?clubId=${CLUB_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setIsClubAdmin(data.isAdmin);
        setCheckingAdmin(false);
      })
      .catch(() => setCheckingAdmin(false));

    fetchAdmins();
    fetchSocialLinks();
  }, [session, status, fetchAdmins, fetchSocialLinks]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.refresh();
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAdmin(true);
    setAdminError("");

    const res = await fetch("/api/club-site-admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubId: CLUB_ID,
        email: newAdminEmail,
        name: newAdminName || null,
      }),
    });

    setAddingAdmin(false);

    if (res.ok) {
      setNewAdminEmail("");
      setNewAdminName("");
      setShowAdminModal(false);
      fetchAdmins();
    } else {
      const data = await res.json();
      setAdminError(data.error || "Failed to add admin");
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    if (!confirm("Remove this admin?")) return;

    await fetch(`/api/club-site-admins?id=${id}`, { method: "DELETE" });
    fetchAdmins();
  };

  if (status === "loading" || checkingAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header currentPage="" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#c41e3a]" size={48} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header currentPage="" />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md mx-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#c41e3a]/10 rounded-full mb-4">
                  <Lock className="text-[#c41e3a]" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Login
                </h1>
                <p className="text-gray-600 mt-2">
                  Sign in to manage the Rome Hibernia website
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Honeypot field - hidden from users, bots will fill it */}
                <input
                  type="text"
                  name="website"
                  autoComplete="off"
                  tabIndex={-1}
                  className="absolute -left-[9999px]"
                  aria-hidden="true"
                />

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c41e3a] text-white py-3 rounded-lg font-semibold hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <LogIn size={20} />
                  )}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isClubAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header currentPage="" />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md mx-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#c41e3a]/10 rounded-full mb-4">
                  <Lock className="text-[#c41e3a]" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Login
                </h1>
                <p className="text-gray-600 mt-2">
                  Sign in to manage the Rome Hibernia website
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="text"
                  name="website"
                  autoComplete="off"
                  tabIndex={-1}
                  className="absolute -left-[9999px]"
                  aria-hidden="true"
                />

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c41e3a] text-white py-3 rounded-lg font-semibold hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <LogIn size={20} />
                  )}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeSocialCount = Object.values(socialLinks).filter(Boolean).length;

  const adminLinks = [
    {
      title: "Gallery Manager",
      description: "Upload, reorder, and manage gallery photos",
      icon: Images,
      href: `${basePath}/gallery/admin`,
    },
    {
      title: "Edit Content",
      description: "Edit text content across the website",
      icon: FileText,
      href: `${basePath}`,
      note: "Click any editable text on the site to edit it",
    },
    {
      title: "Social Media Links",
      description: `Manage social media links (${activeSocialCount} active)`,
      icon: Link,
      href: "#",
      onClick: () => setShowSocialModal(true),
    },
    {
      title: "Instagram Feed",
      description: "Instagram feed status and settings",
      icon: Instagram,
      href: "#",
      disabled: true,
      note: "Managed via environment variables",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="" />

      <main className="flex-1 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Site Administration
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {adminLinks.map((link) => (
              <div key={link.title}>
                {link.disabled ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 opacity-75">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-200 rounded-lg">
                        <link.icon className="text-gray-500" size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-700">
                          {link.title}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                          {link.description}
                        </p>
                        {link.note && (
                          <p className="text-gray-400 text-xs mt-2 italic">
                            {link.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : link.onClick ? (
                  <button
                    type="button"
                    onClick={link.onClick}
                    className="w-full text-left bg-white rounded-xl p-6 border border-gray-200 hover:border-[#c41e3a] hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#c41e3a]/10 rounded-lg group-hover:bg-[#c41e3a] transition-colors">
                        <link.icon
                          className="text-[#c41e3a] group-hover:text-white transition-colors"
                          size={24}
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#c41e3a] transition-colors">
                          {link.title}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <InternalLink
                    href={link.href}
                    className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-[#c41e3a] hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#c41e3a]/10 rounded-lg group-hover:bg-[#c41e3a] transition-colors">
                        <link.icon
                          className="text-[#c41e3a] group-hover:text-white transition-colors"
                          size={24}
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#c41e3a] transition-colors">
                          {link.title}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          {link.description}
                        </p>
                        {link.note && (
                          <p className="text-gray-400 text-xs mt-2 italic">
                            {link.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </InternalLink>
                )}
              </div>
            ))}
          </div>

          {/* Admin Management - Only visible to SUPER_ADMIN */}
          {isSuperAdmin && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users size={24} />
                  Site Administrators
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center gap-2 bg-[#c41e3a] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a01830] transition-colors"
                >
                  <Plus size={18} />
                  Add Admin
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {admins.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No admins added yet. Only SUPER_ADMINs can access by
                    default.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {admins.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {admin.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {admin.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveAdmin(admin.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Remove admin"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Settings className="text-blue-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-blue-900">Editing Tip</h3>
                <p className="text-blue-700 text-sm mt-1">
                  When you&apos;re logged in as an admin, you can click on most
                  text on the website to edit it directly. Look for text that
                  highlights when you hover over it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Add Site Admin
              </h2>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Add an email address to grant admin access to this site. The user
              must have a PlayAway account with this email.
            </p>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="admin-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name (optional)
                </label>
                <input
                  id="admin-name"
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                />
              </div>

              {adminError && (
                <p className="text-red-600 text-sm">{adminError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingAdmin}
                  className="flex-1 bg-[#c41e3a] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a01830] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addingAdmin && (
                    <Loader2 className="animate-spin" size={18} />
                  )}
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Media Links Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Social Media Links
              </h2>
              <button
                type="button"
                onClick={() => setShowSocialModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Add links to your social media profiles. Only platforms with links
              will show on the website.
            </p>

            <div className="space-y-4">
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const value = socialLinks[platform.key as keyof SocialLinks];
                const isFilled = Boolean(value);
                return (
                  <div key={platform.key}>
                    <label
                      htmlFor={`social-${platform.key}`}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
                    >
                      <Icon
                        size={16}
                        className={isFilled ? "text-green-600" : ""}
                      />
                      {platform.label}
                      {isFilled && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <Check size={12} />
                          Added
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        id={`social-${platform.key}`}
                        type="url"
                        value={value}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            [platform.key]: e.target.value,
                          }))
                        }
                        placeholder={platform.placeholder}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent text-sm ${
                          isFilled
                            ? "border-green-400 bg-green-50/50 pr-10"
                            : "border-gray-300"
                        }`}
                      />
                      {isFilled && (
                        <Check
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {socialError && (
              <p className="text-red-600 text-sm mt-4">{socialError}</p>
            )}

            {socialSuccess && (
              <p className="text-green-600 text-sm mt-4 flex items-center gap-2">
                <Check size={16} />
                Social links saved successfully!
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowSocialModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSocialLinks}
                disabled={savingSocial}
                className="flex-1 bg-[#c41e3a] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a01830] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingSocial && <Loader2 className="animate-spin" size={18} />}
                Save Links
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
