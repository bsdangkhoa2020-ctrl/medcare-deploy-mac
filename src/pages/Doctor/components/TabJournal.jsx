import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Toast from '../../../components/Toast';
import { Icon, ICONS, Modal, InputField, SelectField } from './shared';

const EMPTY_ARTICLE = { title: '', target_audience: 'both', thumbnail_url: '', content: '', status: 'draft' };

export default function TabJournal() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState({ open: false, mode: 'create', data: EMPTY_ARTICLE });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  const showToast = (msg, type = 'info') => setToast({ isVisible: true, message: msg, type });

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error: artErr } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (artErr) { console.warn('articles table:', artErr.message); }
    setArticles(data || []);
    setLoading(false);
  };

  const filtered = articles.filter(a => filter === 'all' || a.target_audience === filter || a.target_audience === 'both');

  const openCreate = () => setModal({ open: true, mode: 'create', data: { ...EMPTY_ARTICLE } });
  const openEdit = (a) => setModal({ open: true, mode: 'edit', data: { ...a } });

  const saveArticle = async (publish = false) => {
    const { data: d } = modal;
    if (!d.title.trim()) return showToast('Nhập tiêu đề bài viết', 'error');
    setSaving(true);
    const payload = { ...d, status: publish ? 'published' : d.status };
    let error;
    if (modal.mode === 'create') {
      ({ error } = await supabase.from('articles').insert(payload));
    } else {
      ({ error } = await supabase.from('articles').update(payload).eq('id', d.id));
    }
    setSaving(false);
    if (error) return showToast('Lỗi: ' + error.message, 'error');
    showToast(publish ? 'Đã xuất bản bài viết' : 'Đã lưu bản nháp', 'success');
    setModal(m => ({ ...m, open: false }));
    fetchArticles();
  };

  const deleteArticle = async (id) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) return showToast('Lỗi xoá: ' + error.message, 'error');
    showToast('Đã xoá bài viết', 'success');
    setDeleteId(null);
    fetchArticles();
  };

  const audienceLabel = (t) => ({ ob: 'Sản khoa', gy: 'Phụ khoa', both: 'Tất cả' }[t] || t);
  const audienceColor = (t) => t === 'ob' 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    : t === 'gy' 
    ? 'bg-gy-lt text-gy-dk border-gy-md' 
    : 'bg-[#F5F1EB] text-ink-muted border-[#E8D8C8]';

  const updateField = (field, val) => setModal(m => ({ ...m, data: { ...m.data, [field]: val } }));

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-gold/30 shadow-sm">
        <div className="flex bg-[#FDFBF7] shadow-sm rounded-xl p-1.5 gap-1 border border-gold/30 w-full sm:w-auto">
          {[['all', 'Tất cả'], ['ob', 'Sản khoa'], ['gy', 'Phụ khoa']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === v ? 'bg-ink text-gold-lt shadow border border-ink' : 'text-ink-muted hover:text-ink hover:bg-gold-lt/30'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={openCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-ink text-gold-lt px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-ink-2 transition-all shadow-md">
          <Icon d={ICONS.plus} className="w-4 h-4" /> Soạn bài mới
        </button>
      </div>

      {/* Article list */}
      {loading ? (
        <div className="p-16 flex justify-center items-center gap-3 text-ink-muted text-sm font-medium">
          <svg className="w-5 h-5 animate-spin text-gold-dk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          Đang tải ấn phẩm...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-gold/30 p-16 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gold-lt rounded-full flex items-center justify-center text-gold-dk">
            <Icon d={ICONS.journal} className="w-8 h-8" />
          </div>
          <p className="font-serif text-xl font-semibold text-ink mb-1">Chưa có bài viết nào</p>
          <p className="text-sm text-ink-muted">Hãy viết ấn phẩm y khoa đầu tiên để chia sẻ với bệnh nhân.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <div key={a.id} className="bg-surface rounded-2xl border border-gold/30 shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col group">
              <div className="aspect-[4/3] bg-gold-lt/30 overflow-hidden relative">
                {a.thumbnail_url ? (
                  <img src={a.thumbnail_url} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={e => e.target.style.display = 'none'} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold/30">
                    <Icon d={ICONS.image} className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border shadow-sm font-bold tracking-wide uppercase backdrop-blur-md bg-white/80 ${audienceColor(a.target_audience)}`}>
                    {audienceLabel(a.target_audience)}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-serif font-bold text-ink text-xl leading-snug mb-2 line-clamp-2">{a.title}</h4>
                {a.content && <p className="text-sm text-ink-muted line-clamp-3 mb-4 leading-relaxed flex-1">{a.content}</p>}
                
                <div className="flex items-center justify-between pt-4 border-t border-gold/15 mt-auto">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${a.status === 'published' ? 'bg-ok-lt text-ok' : 'bg-gold-lt text-gold-dk border border-gold/30'}`}>
                    {a.status === 'published' ? (
                      <><Icon d={ICONS.check} className="w-3 h-3" /> Đã xuất bản</>
                    ) : (
                      <>○ Bản nháp</>
                    )}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-2 rounded-xl hover:bg-gold-lt transition-colors text-ink-muted hover:text-gold-dk">
                      <Icon d={ICONS.edit} className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(a.id)} className="p-2 rounded-xl hover:bg-danger-lt transition-colors text-ink-muted hover:text-danger">
                      <Icon d={ICONS.trash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))}
        title={modal.mode === 'create' ? 'Soạn bài viết mới' : 'Chỉnh sửa bài viết'} wide>
        <div className="space-y-5">
          <InputField label="Tiêu đề ấn phẩm" value={modal.data.title} onChange={e => updateField('title', e.target.value)} placeholder="Nhập tiêu đề..." />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Đối tượng đọc" value={modal.data.target_audience} onChange={e => updateField('target_audience', e.target.value)}>
              <option value="both">Tất cả (Sản & Phụ khoa)</option>
              <option value="ob">Chỉ Sản khoa (OB)</option>
              <option value="gy">Chỉ Phụ khoa (GY)</option>
            </SelectField>
            <InputField label="Ảnh bìa (URL)" value={modal.data.thumbnail_url} onChange={e => updateField('thumbnail_url', e.target.value)} placeholder="https://..." />
          </div>
          {modal.data.thumbnail_url && (
            <div className="aspect-[21/9] rounded-xl overflow-hidden border border-gold/30 shadow-sm bg-gold-lt/20">
              <img src={modal.data.thumbnail_url} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Nội dung chi tiết</label>
            <textarea value={modal.data.content} onChange={e => updateField('content', e.target.value)}
              placeholder="Nhập nội dung bài viết vào đây..."
              className="w-full px-4 py-3 bg-white border border-gold/40 shadow-sm rounded-xl text-sm focus:outline-none focus:border-gold-dk focus:ring-2 focus:ring-gold/30 transition-all resize-none min-h-[240px] text-ink leading-relaxed" />
          </div>
          <div className="flex gap-4 pt-4 border-t border-gold/15">
            <button onClick={() => saveArticle(false)} disabled={saving}
              className="flex-1 py-3.5 bg-surface border-2 border-gold-dk text-gold-dk font-bold rounded-xl hover:bg-gold-lt shadow-sm transition-all disabled:opacity-50">
              {saving ? '...' : 'Lưu bản nháp'}
            </button>
            <button onClick={() => saveArticle(true)} disabled={saving}
              className="flex-1 py-3.5 bg-ink text-gold-lt font-bold rounded-xl hover:bg-ink-2 shadow-md transition-all disabled:opacity-50">
              {saving ? 'Đang xuất bản...' : 'Xuất bản ngay'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Xoá ấn phẩm">
        <div className="space-y-5 text-center px-4 py-2">
          <div className="w-16 h-16 bg-danger-lt rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Icon d={ICONS.alert} className="w-8 h-8 text-danger" />
          </div>
          <div>
            <p className="text-ink font-bold text-lg font-serif mb-1">Xác nhận xoá bài viết?</p>
            <p className="text-sm text-ink-muted leading-relaxed">Hành động này sẽ xoá vĩnh viễn ấn phẩm khỏi hệ thống và không thể khôi phục.</p>
          </div>
          <div className="flex gap-4 pt-2">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-gold/40 bg-surface rounded-xl text-ink font-bold hover:bg-gold-lt shadow-sm transition-all">Huỷ bỏ</button>
            <button onClick={() => deleteArticle(deleteId)} className="flex-1 py-3 bg-danger text-white font-bold rounded-xl hover:bg-danger-dk shadow-md transition-all">Xoá vĩnh viễn</button>
          </div>
        </div>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}
