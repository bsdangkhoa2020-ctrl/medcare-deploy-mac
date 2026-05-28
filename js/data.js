/* ════════════════════════════════════════════════════════════
   JS — MOCK DATABASE & ILLUSTRATIONS (data.js)
   Chứa dữ liệu thai kỳ, SVG minh họa, dinh dưỡng và workshop
════════════════════════════════════════════════════════════ */

// Workshop configs — Cập nhật thường xuyên
const WORKSHOP_CURRENT = {
  title:  'Hậu sản không "rệu rã"',
  date:   '10.05.2026 · 10h00',
  youtube: '#',
  banner: 'https://tnehhratorbrxjwzqnds.supabase.co/storage/v1/object/public/public-assets/ManHinhCho_WS_NextG_Cal_Final.PNG'
};

const WORKSHOP_HISTORY = [
  { title: 'Dinh dưỡng 3 tháng cuối thai kỳ',  date: '03.05.2026', youtube: '#' },
  { title: 'Vận động nhẹ nhàng khi mang thai',  date: '26.04.2026', youtube: '#' },
  { title: 'Chuẩn bị tâm lý trước khi sinh',    date: '19.04.2026', youtube: '#' },
];

// SVG strings — common defs trích vào hàm để giảm dung lượng
function _wombDefs(id){
  return '<defs>'+
    '<linearGradient id="wo'+id+'" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#C97B91"/><stop offset="100%" stop-color="#9E5C73"/></linearGradient>'+
    '<radialGradient id="wi'+id+'" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#5A3D52"/><stop offset="100%" stop-color="#3E2A3D"/></radialGradient>'+
  '</defs>';
}

const _WOMB_OUTER = '<circle cx="100" cy="100" r="88" fill="none" stroke="#A88656" stroke-width="1" stroke-dasharray="3 5" opacity=".65"/><path d="M 100 30 Q 58 32 48 75 Q 38 118 60 152 Q 82 182 110 180 Q 152 175 160 130 Q 164 78 145 50 Q 125 28 100 30 Z" fill="url(#wo{ID})"/><path d="M 100 48 Q 68 52 60 86 Q 54 118 74 142 Q 92 165 112 162 Q 142 158 148 124 Q 152 84 134 60 Q 120 48 100 48 Z" fill="url(#wi{ID})"/>';
const _HEART_OUT = '<path d="M 178 110 Q 170 100 178 92 Q 184 98 184 100 Q 184 98 190 92 Q 198 100 190 110 Q 184 116 178 110 Z" fill="#C97B91" stroke="#9E5C73" stroke-width="1.2"/>';
const _SPARKLES = '<g fill="#C7A47B" opacity=".7"><circle cx="40" cy="45" r="1.3"/><circle cx="158" cy="40" r="1.1"/></g>';

function _svg(id, content){
  const womb = _WOMB_OUTER.replace(/{ID}/g, id);
  return '<svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+
    _wombDefs(id) + womb + content + _SPARKLES +
  '</svg>';
}

const BABY_SVG = {
  4: _svg('4',
    '<ellipse cx="100" cy="118" rx="14" ry="10" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<path d="M 96 120 Q 100 124 106 122" stroke="#E8B098" stroke-width="1.2" fill="none" opacity=".6"/>'+
    '<circle cx="100" cy="116" r="2" fill="#C97B91"/><circle cx="100" cy="116" r="3" fill="none" stroke="#FAE5EB" stroke-width=".8" opacity=".7"/>'+
    '<ellipse cx="118" cy="105" rx="6" ry="4" fill="#F5C9AB" stroke="#3D2818" stroke-width=".8" opacity=".7"/>'+
    '<line x1="112" y1="115" x2="116" y2="108" stroke="#3D2818" stroke-width="1" opacity=".7"/>'+
    _HEART_OUT
  ),
  8: _svg('8',
    '<path d="M 95 100 Q 80 105 82 125 Q 88 142 106 142 Q 124 138 124 122 Q 122 105 110 102 Q 100 98 95 100 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<circle cx="105" cy="100" r="16" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<path d="M 99 100 Q 102 99 105 100" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 108 100 Q 111 99 114 100" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 103 107 Q 107 109 111 107" stroke="#3D2818" stroke-width="1" fill="none" stroke-linecap="round"/>'+
    '<ellipse cx="97" cy="105" rx="2.5" ry="1.8" fill="#E8A1B5" opacity=".5"/>'+
    '<circle cx="84" cy="118" r="4" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<circle cx="124" cy="118" r="4" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<circle cx="96" cy="138" r="4" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<circle cx="116" cy="138" r="4" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<path d="M 105 122 Q 100 118 103 114 Q 105 116 105 117 Q 105 116 107 114 Q 110 118 105 122 Z" fill="#C97B91"/>'+
    '<path d="M 132 100 Q 142 118 138 140" stroke="#C97B91" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
    _HEART_OUT
  ),
  12: _svg('12',
    '<path d="M 138 80 Q 145 100 138 125" stroke="#C97B91" stroke-width="2.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 80 95 Q 62 110 65 140 Q 75 162 105 160 Q 132 155 135 128 Q 132 100 118 92 Q 100 86 80 95 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 80 115 Q 72 130 78 150" stroke="#E8B098" stroke-width="1.5" fill="none" opacity=".4"/>'+
    '<circle cx="92" cy="92" r="20" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 82 92 Q 86 90 90 92" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 94 92 Q 98 90 102 92" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 84 91 L 83 89" stroke="#3D2818" stroke-width=".5"/><path d="M 96 91 L 95 89" stroke="#3D2818" stroke-width=".5"/>'+
    '<ellipse cx="80" cy="100" rx="3" ry="2" fill="#E8A1B5" opacity=".5"/>'+
    '<path d="M 88 104 Q 92 105 96 104" stroke="#3D2818" stroke-width="1" fill="none" stroke-linecap="round"/>'+
    '<ellipse cx="88" cy="108" rx="6" ry="4" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.1"/>'+
    '<path d="M 90 105 Q 92 102 91 100" stroke="#3D2818" stroke-width="1" fill="#FBE0CC"/>'+
    '<ellipse cx="115" cy="125" rx="6" ry="4" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.1"/>'+
    '<ellipse cx="128" cy="148" rx="9" ry="5" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.1"/>'+
    _HEART_OUT
  ),
  16: _svg('16',
    '<path d="M 138 70 Q 148 90 140 115" stroke="#C97B91" stroke-width="2.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 78 98 Q 58 113 62 142 Q 72 168 105 166 Q 138 160 142 130 Q 140 100 122 90 Q 100 84 78 98 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 80 116 Q 72 134 78 152" stroke="#E8B098" stroke-width="1.5" fill="none" opacity=".4"/>'+
    '<circle cx="90" cy="90" r="22" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 102 80 Q 110 92 107 105" stroke="#E8B098" stroke-width="1.5" fill="none" opacity=".4"/>'+
    '<path d="M 78 74 Q 84 68 90 72 Q 96 66 102 72 Q 99 76 90 76 Q 81 78 78 74 Z" fill="#5A3E2B" opacity=".55" stroke="#3D2818" stroke-width=".7"/>'+
    '<path d="M 80 90 Q 84 88 88 90" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 92 90 Q 96 88 100 90" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 82 89 L 81 87" stroke="#3D2818" stroke-width=".5"/><path d="M 94 89 L 93 87" stroke="#3D2818" stroke-width=".5"/>'+
    '<ellipse cx="78" cy="98" rx="3.5" ry="2.5" fill="#E8A1B5" opacity=".55"/>'+
    '<path d="M 92 94 Q 94 97 92 100" stroke="#3D2818" stroke-width="1.1" fill="none" stroke-linecap="round"/>'+
    '<path d="M 88 104 Q 92 106 96 104" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 110 96 Q 118 96 116 106 Q 108 106 110 96 Z" fill="#FAE5EB" stroke="#C97B91" stroke-width="1.3"/>'+
    '<path d="M 112 100 Q 114 100 113 104" stroke="#C97B91" stroke-width=".8" fill="none"/>'+
    '<g stroke="#C97B91" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6">'+
    '<path d="M 130 95 Q 134 100 130 105"/><path d="M 138 92 Q 144 100 138 108"/></g>'+
    '<ellipse cx="80" cy="118" rx="6" ry="4" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.1"/>'+
    '<g stroke="#3D2818" stroke-width=".5" stroke-linecap="round"><line x1="76" y1="118" x2="76" y2="121"/><line x1="79" y1="116" x2="79" y2="120"/><line x1="82" y1="116" x2="82" y2="120"/></g>'+
    '<ellipse cx="125" cy="152" rx="10" ry="6" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    _HEART_OUT
  ),
  20: _svg('20',
    '<path d="M 138 70 Q 148 95 138 118" stroke="#C97B91" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
    '<path d="M 75 100 Q 55 115 60 145 Q 70 170 105 168 Q 138 162 140 130 Q 138 100 122 90 Q 100 84 75 100 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 78 118 Q 70 135 76 152" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<circle cx="90" cy="92" r="22" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 102 82 Q 110 92 107 106" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<path d="M 78 76 Q 82 70 90 74 Q 96 68 102 74 Q 100 78 90 78 Q 80 80 78 76 Z" fill="#5A3E2B" opacity=".7" stroke="#3D2818" stroke-width=".8"/>'+
    '<path d="M 82 92 Q 86 90 90 92" stroke="#3D2818" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 94 92 Q 98 90 102 92" stroke="#3D2818" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 84 91 L 83 89" stroke="#3D2818" stroke-width=".6"/><path d="M 96 91 L 95 89" stroke="#3D2818" stroke-width=".6"/>'+
    '<ellipse cx="78" cy="100" rx="3.5" ry="2.5" fill="#E8A1B5" opacity=".55"/>'+
    '<path d="M 92 96 Q 94 99 92 102" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 88 106 Q 92 108 96 106" stroke="#3D2818" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 108 96 Q 114 96 112 104 Q 106 104 108 96 Z" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<ellipse cx="78" cy="120" rx="7" ry="5" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<g stroke="#3D2818" stroke-width=".7" stroke-linecap="round"><line x1="73" y1="120" x2="73" y2="124"/><line x1="76" y1="118" x2="76" y2="123"/><line x1="79" y1="117" x2="79" y2="123"/><line x1="82" y1="118" x2="82" y2="123"/></g>'+
    '<ellipse cx="148" cy="138" rx="13" ry="7" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3" transform="rotate(20 148 138)"/>'+
    '<g fill="#F5C9AB" stroke="#3D2818" stroke-width=".5"><circle cx="156" cy="135" r="1.5"/><circle cx="159" cy="138" r="1.5"/></g>'+
    '<g stroke="#FAE5EB" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".75"><path d="M 167 130 Q 173 130 176 132"/><path d="M 172 138 Q 178 138 181 138"/><path d="M 169 145 Q 175 146 178 148"/></g>'+
    '<ellipse cx="92" cy="158" rx="9" ry="5" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    _HEART_OUT
  ),
  24: _svg('24',
    '<path d="M 140 65 Q 148 90 140 115" stroke="#C97B91" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
    '<path d="M 75 100 Q 55 115 60 145 Q 70 170 105 168 Q 138 162 140 130 Q 138 100 122 90 Q 100 84 75 100 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 78 118 Q 70 135 76 152" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<circle cx="90" cy="92" r="23" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 103 82 Q 111 92 108 106" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<path d="M 76 75 Q 82 67 90 71 Q 96 65 104 71 Q 108 76 106 82 Q 100 76 92 78 Q 84 76 78 82 Q 74 78 76 75 Z" fill="#5A3E2B" opacity=".75" stroke="#3D2818" stroke-width=".8"/>'+
    '<path d="M 82 92 Q 86 90 90 92" stroke="#3D2818" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 94 92 Q 98 90 102 92" stroke="#3D2818" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 84 91 L 83 89" stroke="#3D2818" stroke-width=".6"/><path d="M 96 91 L 95 89" stroke="#3D2818" stroke-width=".6"/>'+
    '<ellipse cx="78" cy="100" rx="3.5" ry="2.5" fill="#E8A1B5" opacity=".55"/>'+
    '<path d="M 92 96 Q 94 99 92 102" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 86 106 Q 92 110 98 106" stroke="#3D2818" stroke-width="1.3" fill="#C97B91" opacity=".9"/>'+
    '<ellipse cx="92" cy="107" rx="2" ry="1" fill="#E8A1B5" opacity=".7"/>'+
    '<path d="M 110 96 Q 116 96 114 104 Q 108 104 110 96 Z" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<ellipse cx="80" cy="108" rx="6" ry="4" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<g stroke="#3D2818" stroke-width=".6" stroke-linecap="round"><line x1="76" y1="108" x2="76" y2="111"/><line x1="79" y1="106" x2="79" y2="110"/><line x1="82" y1="106" x2="82" y2="110"/></g>'+
    '<ellipse cx="118" cy="130" rx="6" ry="4" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<ellipse cx="125" cy="155" rx="11" ry="6" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    _HEART_OUT
  ),
  28: _svg('28',
    '<ellipse cx="85" cy="78" rx="22" ry="30" fill="#FAE5EB" opacity=".15"/>'+
    '<path d="M 140 65 Q 148 90 138 115 Q 130 138 142 158" stroke="#C97B91" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
    '<path d="M 75 100 Q 55 115 60 145 Q 70 170 105 168 Q 138 162 140 130 Q 138 102 122 92 Q 100 86 75 100 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 78 118 Q 70 135 76 152 Q 86 162 100 162" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<circle cx="92" cy="92" r="24" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 105 82 Q 114 92 110 108" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<path d="M 76 76 Q 82 68 90 72 Q 96 66 104 72 Q 108 78 106 84 Q 100 78 92 80 Q 84 78 78 84 Q 74 80 76 76 Z" fill="#5A3E2B" stroke="#3D2818" stroke-width=".8"/>'+
    '<path d="M 82 92 Q 86 90 90 92" stroke="#3D2818" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    '<path d="M 94 92 Q 98 90 102 92" stroke="#3D2818" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    '<path d="M 84 91 L 83 89" stroke="#3D2818" stroke-width=".7"/><path d="M 86 91 L 86 89" stroke="#3D2818" stroke-width=".6"/>'+
    '<path d="M 96 91 L 95 89" stroke="#3D2818" stroke-width=".7"/><path d="M 98 91 L 98 89" stroke="#3D2818" stroke-width=".6"/>'+
    '<ellipse cx="80" cy="100" rx="3.5" ry="2.5" fill="#E8A1B5" opacity=".55"/>'+
    '<path d="M 95 96 Q 97 99 95 102" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 88 106 Q 92 109 96 106" stroke="#3D2818" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 110 96 Q 116 96 114 104 Q 108 104 110 96 Z" fill="#FAE5EB" stroke="#C97B91" stroke-width="1.2"/>'+
    '<g stroke="#C97B91" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".55"><path d="M 122 96 Q 126 100 122 104"/><path d="M 128 92 Q 134 100 128 108"/></g>'+
    '<ellipse cx="80" cy="116" rx="7" ry="5" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<g stroke="#3D2818" stroke-width=".7" stroke-linecap="round"><line x1="74" y1="116" x2="74" y2="120"/><line x1="77" y1="114" x2="77" y2="119"/><line x1="80" y1="113" x2="80" y2="119"/><line x1="83" y1="114" x2="83" y2="119"/></g>'+
    '<ellipse cx="128" cy="155" rx="11" ry="6" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<g fill="#F5C9AB" stroke="#3D2818" stroke-width=".5"><circle cx="120" cy="154" r="1.3"/><circle cx="122" cy="158" r="1"/></g>'+
    '<path d="M 178 110 Q 170 100 178 92 Q 184 98 184 100 Q 184 98 190 92 Q 198 100 190 110 Q 184 116 178 110 Z" fill="#C97B91" stroke="#9E5C73" stroke-width="1.2"/>'+
    '<path d="M 182 100 Q 184 96 186 98" stroke="#FAE5EB" stroke-width="1" fill="none" stroke-linecap="round" opacity=".7"/>'
  ),
  32: _svg('32',
    '<path d="M 142 60 Q 150 90 140 115 Q 132 138 144 158" stroke="#C97B91" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
    '<path d="M 70 96 Q 50 113 55 144 Q 65 172 105 170 Q 142 165 145 132 Q 142 100 124 88 Q 100 80 70 96 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 75 116 Q 67 134 73 154 Q 83 165 100 165" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<circle cx="90" cy="88" r="25" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 104 78 Q 113 90 109 105" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<path d="M 74 72 Q 80 64 88 68 Q 94 60 102 66 Q 108 72 106 80 Q 104 76 96 76 Q 88 78 80 78 Q 74 80 74 72 Z" fill="#5A3E2B" stroke="#3D2818" stroke-width=".8"/>'+
    '<path d="M 80 88 Q 84 86 88 88" stroke="#3D2818" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    '<path d="M 92 88 Q 96 86 100 88" stroke="#3D2818" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    '<path d="M 82 87 L 81 85" stroke="#3D2818" stroke-width=".6"/><path d="M 94 87 L 93 85" stroke="#3D2818" stroke-width=".6"/>'+
    '<ellipse cx="78" cy="96" rx="3.5" ry="2.5" fill="#E8A1B5" opacity=".55"/>'+
    '<path d="M 93 92 Q 95 95 93 98" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<ellipse cx="92" cy="103" rx="3" ry="2" fill="#3D2818" opacity=".7"/>'+
    '<ellipse cx="92" cy="102.5" rx="2.5" ry="1" fill="#C97B91" opacity=".6"/>'+
    '<path d="M 108 92 Q 114 92 112 100 Q 106 100 108 92 Z" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<g stroke="#FAE5EB" stroke-width=".9" fill="rgba(250,229,235,.4)" opacity=".8"><circle cx="98" cy="106" r="2.5"/><circle cx="105" cy="108" r="1.8"/><circle cx="112" cy="110" r="1.2"/></g>'+
    '<ellipse cx="78" cy="118" rx="7" ry="5" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<g stroke="#3D2818" stroke-width=".7" stroke-linecap="round"><line x1="73" y1="118" x2="73" y2="122"/><line x1="76" y1="116" x2="76" y2="121"/><line x1="79" y1="115" x2="79" y2="121"/><line x1="82" y1="116" x2="82" y2="121"/></g>'+
    '<ellipse cx="130" cy="158" rx="12" ry="7" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<g fill="#F5C9AB" stroke="#3D2818" stroke-width=".5"><circle cx="121" cy="156" r="1.3"/><circle cx="123" cy="160" r="1"/></g>'+
    _HEART_OUT
  ),
  36: _svg('36',
    '<path d="M 145 55 Q 142 80 130 95 Q 116 105 110 90" stroke="#C97B91" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
    '<path d="M 78 60 Q 58 75 55 100 Q 55 130 75 145 Q 100 155 122 145 Q 142 130 142 100 Q 138 75 122 60 Q 100 50 78 60 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 80 80 Q 72 100 78 120" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<circle cx="92" cy="138" r="26" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.3"/>'+
    '<path d="M 105 128 Q 114 138 110 154" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<path d="M 70 130 Q 76 122 82 125 Q 88 118 94 122 Q 100 117 106 122 Q 112 124 114 132 Q 110 128 102 128 Q 92 130 84 130 Q 76 132 70 130 Z" fill="#5A3E2B" stroke="#3D2818" stroke-width=".8"/>'+
    '<path d="M 84 138 Q 88 136 92 138" stroke="#3D2818" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    '<path d="M 96 138 Q 100 136 104 138" stroke="#3D2818" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    '<path d="M 86 137 L 85 135" stroke="#3D2818" stroke-width=".7"/><path d="M 88 137 L 88 135" stroke="#3D2818" stroke-width=".6"/>'+
    '<path d="M 98 137 L 97 135" stroke="#3D2818" stroke-width=".7"/><path d="M 100 137 L 100 135" stroke="#3D2818" stroke-width=".6"/>'+
    '<ellipse cx="82" cy="146" rx="3.5" ry="2.5" fill="#E8A1B5" opacity=".55"/>'+
    '<path d="M 95 142 Q 97 145 95 148" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 90 152 Q 94 154 98 152" stroke="#3D2818" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
    '<path d="M 113 142 Q 119 142 117 150 Q 111 150 113 142 Z" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<ellipse cx="125" cy="65" rx="11" ry="6" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<g fill="#F5C9AB" stroke="#3D2818" stroke-width=".5"><circle cx="116" cy="63" r="1.3"/><circle cx="118" cy="67" r="1"/></g>'+
    '<ellipse cx="80" cy="120" rx="6" ry="4" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<g fill="#C7A47B" opacity=".8"><path d="M 30 28 L 30 36 M 26 32 L 34 32" stroke="#C7A47B" stroke-width="1"/><path d="M 168 30 L 168 38 M 164 34 L 172 34" stroke="#C7A47B" stroke-width="1"/></g>'+
    '<path d="M 178 108 Q 168 96 178 88 Q 184 96 184 98 Q 184 96 190 88 Q 200 96 190 108 Q 184 116 178 108 Z" fill="#C97B91" stroke="#9E5C73" stroke-width="1.2"/>'+
    '<path d="M 182 96 Q 184 92 187 94" stroke="#FAE5EB" stroke-width="1" fill="none" opacity=".7"/>'
  ),
  40: '<svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+
    _wombDefs('40')+
    '<g stroke="#C7A47B" stroke-width=".8" opacity=".5" stroke-linecap="round"><path d="M 100 8 L 100 18"/><path d="M 60 12 L 64 22"/><path d="M 140 12 L 136 22"/><path d="M 22 30 L 30 36"/><path d="M 178 30 L 170 36"/></g>'+
    _WOMB_OUTER.replace(/{ID}/g, '40')+
    '<path d="M 145 55 Q 145 80 135 95" stroke="#C97B91" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
    '<path d="M 75 55 Q 52 70 50 105 Q 50 135 72 148 Q 100 158 128 148 Q 148 135 148 105 Q 145 72 122 55 Q 100 45 75 55 Z" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.4"/>'+
    '<path d="M 78 80 Q 70 105 78 130" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<circle cx="95" cy="140" r="28" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.4"/>'+
    '<path d="M 110 130 Q 120 142 116 158" stroke="#E8B098" stroke-width="2" fill="none" opacity=".35"/>'+
    '<path d="M 68 130 Q 74 120 82 124 Q 88 116 94 120 Q 100 114 106 120 Q 114 122 118 132 Q 114 130 105 128 Q 95 130 84 130 Q 74 132 68 130 Z" fill="#5A3E2B" stroke="#3D2818" stroke-width=".9"/>'+
    '<path d="M 86 140 Q 90 138 94 140" stroke="#3D2818" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
    '<path d="M 98 140 Q 102 138 106 140" stroke="#3D2818" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
    '<path d="M 88 139 L 87 137" stroke="#3D2818" stroke-width=".8"/><path d="M 90 139 L 90 137" stroke="#3D2818" stroke-width=".7"/>'+
    '<path d="M 100 139 L 99 137" stroke="#3D2818" stroke-width=".8"/><path d="M 102 139 L 102 137" stroke="#3D2818" stroke-width=".7"/>'+
    '<ellipse cx="83" cy="148" rx="4" ry="3" fill="#E8A1B5" opacity=".6"/>'+
    '<ellipse cx="107" cy="148" rx="4" ry="3" fill="#E8A1B5" opacity=".6"/>'+
    '<path d="M 96 144 Q 98 147 96 150" stroke="#3D2818" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M 89 156 Q 95 159 101 156" stroke="#3D2818" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    '<path d="M 117 144 Q 124 144 122 152 Q 115 152 117 144 Z" fill="#F5C9AB" stroke="#3D2818" stroke-width="1"/>'+
    '<ellipse cx="125" cy="60" rx="10" ry="6" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<ellipse cx="78" cy="116" rx="6" ry="4" fill="#FBE0CC" stroke="#3D2818" stroke-width="1.2"/>'+
    '<path d="M 95 22 Q 88 14 96 8 Q 100 12 100 14 Q 100 12 104 8 Q 112 14 105 22 Q 100 28 95 22 Z" fill="#C97B91" stroke="#9E5C73" stroke-width="1.2"/>'+
    '<path d="M 98 14 Q 100 11 102 13" stroke="#FAE5EB" stroke-width="1" fill="none" opacity=".8"/>'+
    '<g fill="#C7A47B" opacity=".7"><circle cx="35" cy="55" r="1.5"/><circle cx="165" cy="55" r="1.3"/><circle cx="40" cy="100" r="1"/><circle cx="160" cy="105" r="1.2"/></g>'+
    '<path d="M 178 88 Q 173 82 178 78 Q 181 81 181 82 Q 181 81 184 78 Q 189 82 184 88 Q 181 92 178 88 Z" fill="#E8A1B5" opacity=".8"/>'+
    '<path d="M 25 95 Q 21 90 25 86 Q 28 89 28 90 Q 28 89 31 86 Q 35 90 31 95 Q 28 98 25 95 Z" fill="#E8A1B5" opacity=".7"/>'+
  '</svg>'
};

// Milestone titles + stats
const MILESTONE_DATA = {
  4:  {title:'Phôi thai mới <em>làm tổ</em><br>tim bắt đầu hình thành', len:'2 mm', wt:'<1 g', hr:'90 bpm'},
  8:  {title:'Bé có hình dáng <em>người tí hon</em><br>tim bắt đầu đập', len:'1.6 cm', wt:'1 g', hr:'150 bpm'},
  12: {title:'Bé biết <em>mút ngón tay</em><br>tay chân hoàn chỉnh', len:'5.4 cm', wt:'14 g', hr:'160 bpm'},
  16: {title:'Bé bắt đầu <em>nghe được</em> giọng mẹ', len:'11.6 cm', wt:'100 g', hr:'150 bpm'},
  20: {title:'Mẹ có thể <em>cảm nhận</em> bé đạp', len:'25 cm', wt:'300 g', hr:'145 bpm'},
  24: {title:'Bé phát triển <em>vị giác</em>', len:'30 cm', wt:'600 g', hr:'140 bpm'},
  28: {title:'Bé biết <em>nghe giọng mẹ</em><br>và phản ứng ánh sáng', len:'37 cm', wt:'1.0 kg', hr:'140 bpm'},
  32: {title:'Bé tập <em>thở</em> trong nước ối', len:'42 cm', wt:'1.7 kg', hr:'140 bpm'},
  36: {title:'Bé đã <em>quay đầu xuống</em><br>sẵn sàng chào đời', len:'47 cm', wt:'2.6 kg', hr:'140 bpm'},
  40: {title:'Đến ngày <em>gặp mẹ</em>', len:'50 cm', wt:'3.4 kg', hr:'140 bpm'}
};

// SUPPLEMENT DATA — theo tam cá nguyệt
const SUPPLEMENT_DATA = {
  tcn1: {
    insight: 'Trong giai đoạn này BS. Tuấn khuyên bạn nên bổ sung Acid Folic để bảo vệ ống thần kinh bé, kết hợp Vitamin B6 giúp giảm nghén hiệu quả.',
    products: [
      { name:'Acid Folic 400–800mcg', badge:'BS Tuấn khuyên dùng', benefit:'Ngừa dị tật ống thần kinh. Quan trọng nhất trong 28 ngày đầu thai kỳ.', img:'' },
      { name:'Vitamin B6 25mg',       badge:'BS Tuấn khuyên dùng', benefit:'Giảm buồn nôn, nghén hiệu quả. An toàn cho mẹ bầu tam cá nguyệt 1.', img:'' }
    ]
  },
  tcn2: {
    insight: 'Trong giai đoạn này BS. Tuấn khuyên bạn nên bổ sung DHA để hỗ trợ não và mắt bé, kết hợp Sắt hữu cơ để phòng thiếu máu.',
    products: [
      { name:'DHA 200–300mg',          badge:'BS Tuấn khuyên dùng', benefit:'Hỗ trợ phát triển não và thị giác bé. WHO khuyến nghị suốt thai kỳ.', img:'' },
      { name:'Sắt hữu cơ Chela-Ferr', badge:'BS Tuấn khuyên dùng', benefit:'Sắt chelate hấp thu gấp 3 lần sắt thường. Ít buồn nôn, an toàn cho dạ dày.', img:'' }
    ]
  },
  tcn3: {
    insight: 'Trong giai đoạn này BS. Tuấn khuyên bạn nên bổ sung Canxi chất lượng cao cùng Sắt để hỗ trợ xương bé khoáng hóa tối ưu và chuẩn bị cơ thể mẹ trước sinh.',
    products: [
      { name:'Canxi hữu cơ + D3',      badge:'BS Tuấn khuyên dùng', benefit:'Dễ hấp thu, không táo bón. D3 giúp canxi vào xương tối ưu cho bé.', img:'' },
      { name:'Sắt hữu cơ Chela-Ferr', badge:'BS Tuấn khuyên dùng', benefit:'Sắt chelate hấp thu gấp 3 lần sắt thường. Ít buồn nôn, an toàn cho dạ dày.', img:'' }
    ]
  }
};

function getSupplementByWeek(weeks) {
  if (weeks <= 12) return SUPPLEMENT_DATA.tcn1;
  if (weeks <= 27) return SUPPLEMENT_DATA.tcn2;
  return SUPPLEMENT_DATA.tcn3;
}

const OB_MILESTONES = {
  4:  'Phôi vừa làm tổ, nhỏ như hạt vừng. Tim nguyên thủy đang hình thành.',
  5:  'Tim bé bắt đầu đập. Brain và tủy sống đang phát triển nhanh.',
  6:  'Tim đập rõ hơn, có thể thấy trên siêu âm. Mắt và tai bắt đầu hình thành.',
  7:  'Bé bằng hạt đậu. Não phát triển mạnh, tay chân nhú ra.',
  8:  'Tất cả cơ quan chính đã hình thành. Bé cử động nhưng mẹ chưa cảm nhận được.',
  9:  'Ngón tay, ngón chân đã rõ. Bé nuốt nước ối và bắt đầu nhăn mặt.',
  10: 'Bé bằng quả mận. Xương bắt đầu cứng dần, tóc và móng mọc.',
  11: 'Bé có thể đạp và xoay. Các nội tạng đang hoàn thiện.',
  12: 'Kết thúc tam cá nguyệt 1. Bé bằng quả chanh, phản xạ ngón tay đã có.',
  13: 'Bé có vân tay riêng. Mặt nhìn rõ hơn trên siêu âm.',
  14: 'Bé bằng quả lê. Có thể mút ngón tay, cơ mặt cử động.',
  15: 'Bé nghe được tiếng mẹ. Xương tai trong đang hình thành.',
  16: 'Bé bằng quả bơ. Mắt có thể phát hiện ánh sáng dù còn nhắm.',
  17: 'Lớp mỡ bảo vệ bắt đầu hình thành. Bé có thể ngáp và cau mày.',
  18: 'Bé bằng ớt chuông. Mẹ có thể bắt đầu cảm nhận cử động.',
  19: 'Các giác quan phát triển mạnh. Bé có thể nghe nhạc và tiếng nói.',
  20: 'Giữa thai kỳ. Bé bằng chuối, lông mi và tóc đã mọc.',
  21: 'Bé nuốt nước ối đều đặn. Hệ tiêu hóa luyện tập hoạt động.',
  22: 'Bé bằng quả xoài. Môi và lông mày đã rõ nét.',
  23: 'Bé có thể nghe thấy tiếng tim mẹ. Phổi đang phát triển.',
  24: 'Phổi sản xuất chất surfactant. Bé có thể sống nếu sinh non từ tuần này.',
  25: 'Bé bằng quả bắp. Da vẫn nhăn nhưng đang dày lên mỗi ngày.',
  26: 'Mắt mở được. Bé phản ứng với ánh sáng chiếu qua bụng mẹ.',
  27: 'Não phát triển nhanh. Bé ngủ và thức theo chu kỳ rõ ràng.',
  28: 'Vào tam cá nguyệt 3. Bé bằng bắp cải, phổi gần hoàn thiện.',
  29: 'Bé tăng cân nhanh. Xương cứng dần, cần thêm canxi từ mẹ.',
  30: 'Bé bằng bí đao. Não có các nếp gấp giúp tư duy sau này.',
  31: 'Bé có thể xoay đầu và nắm tay. Mắt phân biệt được sáng tối.',
  32: 'Bé đầy đủ móng tay. Luyện tập thở bằng cử động lồng ngực.',
  33: 'Xương sọ vẫn mềm để dễ sinh. Bé bú mút mạnh hơn.',
  34: 'Hệ miễn dịch đang hoàn thiện. Bé nhận kháng thể từ mẹ qua nhau thai.',
  35: 'Phổi gần hoàn chỉnh. Bé bằng dưa lưới, nặng khoảng 2.4 kg.',
  36: 'Bé thường xoay đầu xuống chuẩn bị sinh. Lớp mỡ đầy đặn.',
  37: 'Thai đủ tháng sớm. Bé có thể chào đời bất cứ lúc nào.',
  38: 'Bé bằng quả dưa hấu nhỏ. Nội tạng đã hoàn toàn sẵn sàng.',
  39: 'Nhau thai truyền kháng thể tối đa. Bé đang chờ ngày ra đời.',
  40: 'Thai đủ ngày. Bé sẵn sàng — chúc mẹ mẹ tròn con vuông!'
};

function obGetMilestone(weeks) {
  if (!weeks || weeks < 4) return 'Giai đoạn rất sớm — bé đang hình thành.';
  if (weeks > 40) return 'Bé đã đủ ngày. Chúc mẹ mẹ tròn con vuông!';
  for (let w = weeks; w >= 4; w--) {
    if (OB_MILESTONES[w]) return OB_MILESTONES[w];
  }
  return '—';
}
