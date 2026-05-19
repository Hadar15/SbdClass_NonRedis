import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Ticket, TrendingUp, Calendar, Plus, ShieldAlert, X, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { api } from '../lib/api';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceVIP, setPriceVIP] = useState('2500000');
  const [priceCAT1, setPriceCAT1] = useState('1500000');
  const [priceCAT2, setPriceCAT2] = useState('800000');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [totalStock, setTotalStock] = useState('');
  const [date, setDate] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  useEffect(() => {
    const currentUserStr = localStorage.getItem('user');
    if (!currentUserStr) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(currentUserStr);
    setUser(parsedUser);
    setLoading(false);

    if (parsedUser.role === 'SELLER') {
      fetchEvents();
    }
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Ukuran file maksimal adalah 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    if (!title || !priceVIP || !priceCAT1 || !priceCAT2 || !totalStock || !date) {
      setFormError('Semua kolom bertanda * wajib diisi');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/events', {
        title,
        description,
        priceVIP: parseFloat(priceVIP),
        priceCAT1: parseFloat(priceCAT1),
        priceCAT2: parseFloat(priceCAT2),
        price: parseFloat(priceCAT2),
        imageUrl,
        totalStock: parseInt(totalStock),
        date,
      });

      if (!res.status || res.status >= 300) {
        setFormError('Gagal membuat event');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setPriceVIP('2500000');
      setPriceCAT1('1500000');
      setPriceCAT2('800000');
      setImageUrl(null);
      setTotalStock('');
      setDate('');
      fetchEvents();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="bg-[#09090b] min-h-screen text-white p-20 text-center">Loading...</div>;
  }

  if (user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass p-10 rounded-[40px] text-center border border-zinc-800"
          >
            <div className="mb-6 flex justify-center text-red-400">
              <ShieldAlert size={80} className="glow" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-red-500">Akses Ditolak</h2>
            <p className="text-zinc-400 mb-8 text-sm">Halaman ini hanya dapat diakses oleh akun Penyelenggara Event (Seller).</p>
            <button onClick={() => navigate('/')} className="war-button w-full py-4 rounded-2xl font-bold text-lg">
              Kembali ke Beranda
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  const totalActiveEvents = events.length;
  const totalStockSum = events.reduce((acc, curr) => acc + (curr.totalStock || 0), 0);
  const totalCurrentStockSum = events.reduce((acc, curr) => acc + (curr.currentStock !== undefined ? curr.currentStock : curr.totalStock || 0), 0);
  const totalTicketsSold = totalStockSum - totalCurrentStockSum;

  const mockStats = [
    { label: 'Total Penjualan (Estimasi)', value: `Rp ${(totalTicketsSold * 1500000).toLocaleString()}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Tiket Terjual', value: `${totalTicketsSold}/${totalStockSum}`, icon: Ticket, color: 'text-indigo-400' },
    { label: 'Event Aktif', value: `${totalActiveEvents} Event`, icon: Calendar, color: 'text-amber-400' },
    { label: 'Total Pengunjung Antrean', value: totalTicketsSold > 0 ? (totalTicketsSold * 3).toString() : '0', icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col relative">
      <Navbar />
      <main className="flex-1 container mx-auto px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <LayoutDashboard className="text-indigo-400" />
              Seller Dashboard
            </h1>
            <p className="text-zinc-400 text-sm">Selamat datang kembali, Penyelenggara Event {user.name}!</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-indigo-600/30"
          >
            <Plus size={20} />
            Buat Event Baru
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {mockStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-3xl border border-zinc-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-zinc-500 text-sm font-semibold">{stat.label}</span>
                  <Icon className={`${stat.color}`} size={24} />
                </div>
                <div className="text-3xl font-black">{stat.value}</div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-8 rounded-[40px] border border-zinc-800"
        >
          <h2 className="text-2xl font-black mb-6">Kelola Event Anda</h2>

          {events.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Calendar className="mx-auto mb-4 opacity-35" size={48} />
              Belum ada event yang dibuat. Mulai dengan membuat event baru!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-sm">
                    <th className="pb-4 font-semibold">Foto</th>
                    <th className="pb-4 font-semibold">Nama Event</th>
                    <th className="pb-4 font-semibold">Tanggal</th>
                    <th className="pb-4 font-semibold">Harga VIP</th>
                    <th className="pb-4 font-semibold">Harga CAT 1</th>
                    <th className="pb-4 font-semibold">Harga CAT 2</th>
                    <th className="pb-4 font-semibold">Stok Tiket</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-5">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-12 h-12 object-cover rounded-xl border border-zinc-800"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-650">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td className="py-5 font-bold">{event.title}</td>
                      <td className="py-5 text-zinc-400">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="py-5 text-indigo-400 font-bold">Rp {Number(event.priceVIP).toLocaleString()}</td>
                      <td className="py-5 text-blue-400 font-bold">Rp {Number(event.priceCAT1).toLocaleString()}</td>
                      <td className="py-5 text-green-400 font-bold">Rp {Number(event.priceCAT2).toLocaleString()}</td>
                      <td className="py-5 text-zinc-300">{event.currentStock ?? event.totalStock}</td>
                      <td className="py-5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          Aktif
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <button className="px-4 py-2 rounded-xl text-sm font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-indigo-500 transition-colors">
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="glass w-full max-w-2xl p-10 rounded-[40px] border border-zinc-800 relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 p-2 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-black mb-2">Buat Event Baru</h2>
              <p className="text-zinc-500 mb-8 text-sm">Isi detail event dengan lengkap.</p>

              {formError && (
                <div className="mb-6 flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-3 rounded-2xl text-sm border border-red-500/20">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-500 font-semibold">Nama Event *</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 focus:outline-none focus:border-indigo-500"
                      placeholder="Nama event"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-500 font-semibold">Deskripsi</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 focus:outline-none focus:border-indigo-500"
                      placeholder="Deskripsi event"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-semibold">Harga VIP *</label>
                    <input
                      value={priceVIP}
                      onChange={(e) => setPriceVIP(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 focus:outline-none focus:border-indigo-500"
                      type="number"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-semibold">Harga CAT 1 *</label>
                    <input
                      value={priceCAT1}
                      onChange={(e) => setPriceCAT1(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 focus:outline-none focus:border-indigo-500"
                      type="number"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-semibold">Harga CAT 2 *</label>
                    <input
                      value={priceCAT2}
                      onChange={(e) => setPriceCAT2(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 focus:outline-none focus:border-indigo-500"
                      type="number"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-semibold">Stok Tiket *</label>
                    <input
                      value={totalStock}
                      onChange={(e) => setTotalStock(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 focus:outline-none focus:border-indigo-500"
                      type="number"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-semibold">Tanggal *</label>
                    <input
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 focus:outline-none focus:border-indigo-500"
                      type="date"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-semibold">Gambar (Base64)</label>
                    <div className="mt-2 flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                        <Upload size={16} />
                        <span className="text-sm">Upload</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                      {imageUrl && <span className="text-xs text-zinc-500">Gambar terpilih</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl font-bold text-lg war-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Event'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
