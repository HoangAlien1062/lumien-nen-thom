/* ==========================================================================
   LUMIÈN — Zero-API Smart Vietnamese FAQ Knowledge Base (25 Real Customer Intents)
   Prices synced: Lamp + Candle sets (Ocean, Blue mint, Blossom) = 190.000₫
                  Standalone Refill Candle (Scented Candle) = 45.000₫
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});

  const SHORTHAND_MAP = [
    [/\bbn\b/g, 'bao nhieu'],
    [/\bbnh\b/g, 'bao nhieu'],
    [/\bbnhieu\b/g, 'bao nhieu'],
    [/\bko\b/g, 'khong'],
    [/\bk\b/g, 'khong'],
    [/\bkh\b/g, 'khong'],
    [/\bdc\b/g, 'duoc'],
    [/\bdk\b/g, 'duoc'],
    [/\bsp\b/g, 'san pham'],
    [/\bck\b/g, 'chuyen khoan'],
    [/\bstk\b/g, 'so tai khoan'],
    [/\bsdt\b/g, 'so dien thoai'],
    [/\bfs\b/g, 'freeship'],
    [/\bfree ship\b/g, 'freeship'],
    [/\b190k\b/g, '190000'],
    [/\b200k\b/g, '190000'],
    [/\b45k\b/g, '45000'],
    [/\bhcm\b/g, 'ho chi minh'],
    [/\btphcm\b/g, 'ho chi minh'],
    [/\bhn\b/g, 'ha noi'],
    [/\bntn\b/g, 'nhu the nao'],
    [/\bsao a\b/g, 'nhu the nao']
  ];

  function normalizeVietnamese(raw) {
    let text = String(raw || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    SHORTHAND_MAP.forEach(function (pair) {
      text = text.replace(pair[0], pair[1]);
    });

    return text.replace(/\s+/g, ' ').trim();
  }

  function hasTerm(paddedText, term) {
    return paddedText.indexOf(' ' + term + ' ') !== -1;
  }

  const QUICK_PACKS = [
    [
      'Mùi nào đuổi muỗi tốt nhất?',
      'Có bán hũ nến lẻ không?',
      'Đèn dùng điện hay pin?',
      'Phí giao hàng bao nhiêu?'
    ],
    [
      '1 bộ gồm những gì?',
      'An toàn cho trẻ nhỏ, mẹ bầu không?',
      'Có gói quà & viết thiệp không?',
      'Bảo hành đổi trả thế nào?'
    ],
    [
      'So sánh 3 mùi hương',
      'Mùi có bị nồng không?',
      'Dùng được bao lâu?',
      'Gặp nhân viên tư vấn'
    ]
  ];

  const INTENTS = [
    {
      id: 'human_agent',
      priority: 10,
      suggestContact: true,
      phrases: [
        'gap nhan vien',
        'nhan vien tu van',
        'tu van vien',
        'gap chu shop',
        'noi chuyen voi nguoi',
        'goi lai cho minh',
        'lien he truc tiep',
        'tu van truc tiep'
      ],
      keywords: ['hotline', 'zalo', 'so dien thoai'],
      reply:
        'Dạ LUMIÈN sẵn sàng hỗ trợ trực tiếp ngay ạ! Bạn hãy điền Tên & SĐT vào khung ngay bên dưới rồi bấm Gửi — nhân viên sẽ nhắn Zalo hoặc gọi lại trong 10–15 phút. Bạn cũng có thể gọi thẳng Hotline 0397 133 716 nhé!',
      followUps: ['So sánh 3 mùi hương', 'Có bán hũ nến lẻ không?', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'scent_refill',
      priority: 9,
      phrases: [
        'hu nen le',
        'mua nen le',
        'ban nen le',
        'nen thay the',
        'chi mua nen',
        'scented candle',
        'het nen thay duoc khong',
        'thay nen duoc khong',
        'nen 45000',
        'loai 45000'
      ],
      keywords: ['nen le', 'refill', '45000', 'thay the'],
      reply:
        'Dạ có luôn ạ! LUMIÈN có bán lẻ hũ Scented Candle chỉ 45.000₫ / hũ (sáp đậu nành kem ấm, hương gỗ dịu – vani – sả chanh xua muỗi nhẹ, tỏa hương 25–30 giờ). Bạn có thể mua thắp trực tiếp hoặc mua kèm làm hũ thay thế đặt dưới đèn ngủ LUMIÈN cực tiết kiệm!',
      followUps: ['1 bộ gồm những gì?', 'So sánh 3 mùi hương', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'best_mosquito',
      priority: 9,
      phrases: [
        'mui nao duoi muoi tot nhat',
        'duoi muoi tot nhat',
        'duoi muoi manh nhat',
        'xua muoi tot nhat',
        'duoi duoc muoi that khong',
        'duoi muoi co hieu qua khong',
        'co duoi muoi khong',
        'nha nhieu muoi'
      ],
      keywords: ['duoi muoi', 'xua muoi', 'muoi', 'con trung'],
      reply:
        'Các dòng của LUMIÈN đều chứa tinh dầu thảo mộc tự nhiên giúp xua muỗi an toàn trong phòng 15–25m². Trong đó:\n• Blue mint (190.000₫): Bạc hà Âu + Bạch đàn — đuổi muỗi mạnh & tối ưu nhất.\n• Ocean (190.000₫): Hương biển + Sả tự nhiên — xua muỗi nhẹ dịu, mát thoáng.\n• Blossom (190.000₫): Oải hương + Hoa nhài — dịu ngọt dễ ngủ kèm xua muỗi êm ái.\nNgoài ra có hũ Scented Candle bán lẻ chỉ 45.000₫ ạ!',
      followUps: ['Mùi có bị nồng không?', 'An toàn cho trẻ nhỏ, mẹ bầu không?', 'Có bán hũ nến lẻ không?']
    },
    {
      id: 'compare_scents',
      priority: 8,
      phrases: [
        'so sanh 3 mui',
        'so sanh cac mui',
        'chon mui nao',
        'nen chon mui nao',
        'mui nao thom nhat',
        'mui nao ban chay',
        'mui nao de chiu',
        'khac nhau gi',
        'co may mui',
        'nhung mui nao'
      ],
      keywords: ['so sanh', 'best seller', 'ban chay', 'goi y'],
      reply:
        'Mình gợi ý nhanh theo gu của bạn nhé:\n• Ocean (190.000₫): Hương biển mát lành, thanh khiết, hợp cả nam & nữ.\n• Blue mint (190.000₫): Bạc hà the mát sảng khoái, bán chạy nhất cho phòng nhiều muỗi.\n• Blossom (190.000₫): Hoa nhài – mẫu đơn – oải hương dịu ngọt, dễ ngủ sâu & tặng quà cực xinh.\n• Scented Candle (45.000₫): Hũ nến lẻ sáp kem hương gỗ ấm – vani – sả nhẹ.\nBạn thích tông mát hay tông ngọt ấm hơn ạ?',
      followUps: ['Chi tiết mùi Ocean', 'Chi tiết mùi Blue mint', 'Chi tiết mùi Blossom']
    },
    {
      id: 'scent_ocean',
      priority: 7,
      phrases: ['mui ocean', 'chi tiet ocean', 'den ocean', 'huong bien'],
      keywords: ['ocean', 'bien', 'go lua', 'muoi bien'],
      reply:
        'Ocean (190.000₫ / trọn bộ đèn & nến) mang hương gió biển mát lành, muối biển khoáng đạt hòa cùng gỗ lũa dịu và tinh dầu sả tự nhiên. Tông mùi rất thanh, sạch và nhẹ nhàng, giúp giải tỏa căng thẳng cuối ngày mà vẫn xua muỗi nhẹ dịu ạ!',
      followUps: ['1 bộ gồm những gì?', 'Có bán hũ nến lẻ không?', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'scent_bluemint',
      priority: 7,
      phrases: ['mui blue mint', 'chi tiet blue mint', 'den blue mint', 'huong bac ha'],
      keywords: ['blue mint', 'bluemint', 'mint', 'bac ha', 'bach dan'],
      reply:
        'Blue mint (190.000₫ / trọn bộ đèn & nến) kết hợp tinh dầu Bạc hà Âu tươi mát, lá bạch đàn và vỏ chanh xanh — đây là mùi đuổi muỗi tốt nhất và làm thoáng không khí phòng ngủ cực đã. Thiết kế hũ hoa xanh kèm nơ lụa dưới ánh đèn vàng ấm cũng rất xinh ạ!',
      followUps: ['Mùi có bị nồng không?', 'An toàn cho trẻ nhỏ, mẹ bầu không?', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'scent_blossom',
      priority: 7,
      phrases: ['mui blossom', 'chi tiet blossom', 'den blossom', 'huong hoa', 'mau hong'],
      keywords: ['blossom', 'hoa nhai', 'mau don', 'oai huong', 'ngot'],
      reply:
        'Blossom (190.000₫ / trọn bộ đèn & nến) là sự hòa quyện ngọt thanh, ấm áp từ hoa nhài trắng, cánh mẫu đơn và oải hương thiên nhiên. Mùi hương rất dịu êm giúp thư giãn sâu trước khi ngủ và xua muỗi nhẹ nhàng — cũng là mẫu được chọn làm quà tặng nhiều nhất ạ!',
      followUps: ['Có gói quà & viết thiệp không?', 'Có bán hũ nến lẻ không?', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'strong_smell',
      priority: 8,
      phrases: [
        'co bi nong khong',
        'co nong khong',
        'co hac khong',
        'bi dau dau',
        'nhuc dau',
        'nhay cam mui',
        'mui nhe khong',
        'co kho chiu khong'
      ],
      keywords: ['nong', 'hac', 'dau dau', 'nhuc dau', 'di ung', 'nhay cam'],
      reply:
        'Không hề bị nồng gắt hay hắc như thuốc xịt muỗi đâu ạ! Nến dùng tinh dầu thiên nhiên nên hương lan tỏa êm dịu, thoang thoảng dễ chịu. Nếu bạn nhạy cảm mùi, hãy ưu tiên Ocean, Blossom hoặc hũ Scented Candle (45.000₫) và bật đèn mức Dịu nhẹ nhé.',
      followUps: ['An toàn cho trẻ nhỏ, mẹ bầu không?', 'So sánh 3 mùi hương', 'Cách dùng như thế nào?']
    },
    {
      id: 'sleep_relax',
      priority: 7,
      phrases: ['kho ngu', 'mat ngu', 'de ngu', 'ngu ngon', 'giam stress', 'cang thang', 'thu gian'],
      keywords: ['stress', 'mat ngu', 'kho ngu', 'an than'],
      reply:
        'Nếu bạn ưu tiên dễ ngủ & thư giãn sau ngày dài, LUMIÈN khuyên chọn bộ Blossom (190.000₫ — oải hương + hoa nhài giúp an thần) hoặc Ocean (190.000₫ — hương biển nhẹ nhàng giảm stress). Kết hợp ánh sáng đèn vàng ấm 2700K mức Dịu nhẹ khoảng 30 phút trước khi ngủ sẽ rất dễ vào giấc ạ!',
      followUps: ['Chi tiết mùi Blossom', 'Đèn dùng điện hay pin?', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'whats_included',
      priority: 8,
      phrases: [
        '1 bo gom',
        'mot bo gom',
        'gom nhung gi',
        'co kem nen khong',
        'co kem bong den khong',
        'co kem day cam khong',
        'mua den rieng'
      ],
      keywords: ['kem nen', 'bong den', 'tron bo'],
      reply:
        'Trọn bộ 190.000₫ (Ocean / Blue mint / Blossom) đã đầy đủ sẵn để dùng ngay gồm:\n• 01 đèn gỗ chao hoa thủy tinh kèm bóng ánh sáng vàng ấm 2700K & dây cắm.\n• 01 hũ nến thơm đuổi muỗi nguyên bản theo mùi bạn chọn.\nKhi dùng hết nến, bạn có thể mua thêm hũ Scented Candle lẻ chỉ 45.000₫ để thay và giữ lại đèn ngủ dùng lâu dài ạ!',
      followUps: ['Có bán hũ nến lẻ không?', 'Đèn dùng điện hay pin?', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'power_dimmer',
      priority: 8,
      phrases: [
        'dung dien hay pin',
        'cam dien hay pin',
        'co ton dien khong',
        'chinh do sang',
        'dieu chinh anh sang',
        'co choi mat khong',
        'den ngu duoc khong'
      ],
      keywords: ['dien', 'pin', 'sac', 'usb', 'dimmer', 'cong suat', '2700k', 'choi'],
      reply:
        'Đèn LUMIÈN dùng nguồn cắm điện trực tiếp tiện lợi (không lo hết pin giữa đêm), công suất nhỏ rất tiết kiệm điện. Ánh sáng vàng ấm 2700K dịu êm không gây chói mắt, điều chỉnh được độ sáng từ Dịu nhẹ để ngủ đến Ấm áp giúp nến tỏa hương rõ hơn ạ!',
      followUps: ['Cách dùng như thế nào?', '1 bộ gồm những gì?', 'Dùng được bao lâu?']
    },
    {
      id: 'how_to_use',
      priority: 8,
      phrases: [
        'cach dung',
        'su dung nhu the nao',
        'huong dan su dung',
        'dot bac hay bat den',
        'bat qua dem duoc khong',
        'co nong khong',
        'co bi bong khong'
      ],
      keywords: ['cach dung', 'huong dan', 'bac', 'dot', 'thap', 'qua dem'],
      reply:
        'Đèn tích hợp nến dùng được 2 cách rất linh hoạt:\n1) Bật đèn làm ấm nhẹ hũ nến để lan tỏa hương tinh dầu đều đặn, hoàn toàn không khói đen.\n2) Thắp bấc nến khoảng 20–30 phút trước khi ngủ để đuổi muỗi nhanh, sau đó tắt lửa và chỉ giữ ánh đèn ngủ vàng ấm qua đêm cho an toàn tuyệt đối.\nLưu ý đặt đèn nơi mặt phẳng khô ráo, tránh xa rèm vải khi thắp bấc trực tiếp ạ.',
      followUps: ['Dùng được bao lâu?', 'Mẹo bảo quản nến bền lâu', 'An toàn cho trẻ nhỏ, mẹ bầu không?']
    },
    {
      id: 'burn_duration',
      priority: 8,
      phrases: [
        'dung duoc bao lau',
        'bao nhieu gio',
        'may tuan',
        'may thang',
        'lau het khong',
        'phong bao nhieu m2',
        'dien tich phong'
      ],
      keywords: ['bao lau', 'toa huong', 'thoi gian', 'dung tich', 'm2'],
      reply:
        'Hũ nến trong bộ đèn (190.000₫) tỏa hương bền 35 – 40 giờ (khoảng 3 – 4 tuần nếu dùng 1–2 giờ mỗi tối); hũ nến lẻ Scented Candle (45.000₫) dùng bền 25 – 30 giờ. Riêng thân đèn gỗ & chao thủy tinh dùng bền nhiều năm và thay hũ nến mới rất dễ ạ!',
      followUps: ['Có bán hũ nến lẻ không?', 'Mẹo bảo quản nến bền lâu', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'safety_family',
      priority: 9,
      phrases: [
        'tre nho',
        'tre so sinh',
        'em be',
        'me bau',
        'ba bau',
        'mang thai',
        'thu cung',
        'phong may lanh',
        'phong kin',
        'co khoi den khong',
        'co doc hai khong',
        'co an toan khong'
      ],
      keywords: ['an toan', 'bau', 'cho', 'meo', 'khoi', 'doc hai', 'may lanh'],
      reply:
        'Nến dùng sáp lành tính và tinh dầu thiên nhiên, không khói đen và không chứa hóa chất xịt muỗi độc hại nên rất êm cho phòng máy lạnh gia đình.\nLưu ý nhỏ có tâm từ LUMIÈN: với nhà có trẻ sơ sinh dưới 6 tháng, mẹ bầu 3 tháng đầu hoặc nuôi mèo nhạy cảm tinh dầu, bạn nên bật nến trước 20–30 phút rồi tắt để hương thoang thoảng nhẹ và giữ phòng thông thoáng nhé!',
      followUps: ['Mùi có bị nồng không?', 'Mùi nào đuổi muỗi tốt nhất?', 'Cách dùng như thế nào?']
    },
    {
      id: 'price_combo',
      priority: 8,
      phrases: [
        'gia bao nhieu',
        'bao nhieu tien',
        'mua 2 bo',
        'mua 3 bo',
        'co giam gia khong',
        'co khuyen mai khong',
        'gia si',
        'mua so luong lon'
      ],
      keywords: ['gia', '190000', 'combo', 'giam gia', 'voucher', 'khuyen mai', 'si'],
      reply:
        'Bảng giá LUMIÈN hiện tại siêu ưu đãi ạ:\n• Trọn bộ Đèn & Nến thơm đuổi muỗi (Ocean / Blue mint / Blossom): đồng giá 190.000₫ / bộ.\n• Hũ Nến thơm bán lẻ / thay thế (Scented Candle): chỉ 45.000₫ / hũ.\n• Đơn từ 350.000₫ trở lên (ví dụ 2 bộ đèn): MIỄN PHÍ GIAO HÀNG toàn quốc!\nMua sỉ hoặc quà tặng từ 5 bộ để lại SĐT bên dưới shop báo giá tốt hơn nữa nhé.',
      followUps: ['Phí giao hàng bao nhiêu?', 'Có bán hũ nến lẻ không?', 'Có gói quà & viết thiệp không?']
    },
    {
      id: 'shipping',
      priority: 8,
      phrases: [
        'phi giao hang',
        'phi ship',
        'giao hang bao lau',
        'may ngay nhan duoc',
        'giao toan quoc',
        'giao hoa toc',
        'kiem tra hang',
        'dong kiem',
        'xem hang truoc'
      ],
      keywords: ['ship', 'freeship', 'giao hang', 'van chuyen', 'hoa toc', 'bao lau nhan'],
      reply:
        'Chính sách giao hàng của LUMIÈN:\n• Phí ship đồng giá 25.000₫, MIỄN PHÍ GIAO HÀNG cho đơn từ 350.000₫ trở lên (như 2 bộ đèn 190.000₫).\n• Thời gian giao: Nội thành TP.HCM trong 24h (hỗ trợ hỏa tốc), toàn quốc 2–4 ngày.\n• Khách hàng ĐƯỢC KIỂM TRA HÀNG nguyên vẹn trước khi thanh toán ạ!',
      followUps: ['Bảo hành đổi trả thế nào?', 'Thanh toán thế nào?', '1 bộ gồm những gì?']
    },
    {
      id: 'payment',
      priority: 8,
      phrases: [
        'thanh toan',
        'chuyen khoan',
        'nhan hang tra tien',
        'so tai khoan',
        'tra tien mat',
        'phuong thuc thanh toan'
      ],
      keywords: ['cod', 'ngan hang', 'vietcombank', 'vcb'],
      reply:
        'LUMIÈN hỗ trợ 2 hình thức thanh toán linh hoạt ngay lúc đặt hàng:\n1) COD — Thanh toán tiền mặt khi nhận & kiểm tra hàng.\n2) Chuyển khoản ngân hàng (Vietcombank · STK 1028 6824 6888 · Chủ TK: NGUYEN MINH ANH · LUMIEN STUDIO, nội dung ghi Mã đơn hàng).',
      followUps: ['Phí giao hàng bao nhiêu?', 'Cách đặt hàng trên web', 'Bảo hành đổi trả thế nào?']
    },
    {
      id: 'warranty_return',
      priority: 8,
      phrases: [
        'bao hanh',
        'doi tra',
        'bi vo',
        'bi be',
        'nut vo',
        'hang loi',
        'dong goi chong soc'
      ],
      keywords: ['vo', 'be', 'loi', 'hong', 'hu', 'chong soc', 'doi moi'],
      reply:
        'Bạn hoàn toàn yên tâm ạ! Mọi đơn hàng đều được LUMIÈN bọc xốp chống sốc 2 lớp riêng cho chao hoa và hũ thủy tinh.\nShop cam kết ĐỔI MỚI 1–1 MIỄN PHÍ trong 7 ngày nếu sản phẩm có lỗi đèn hoặc nứt vỡ do vận chuyển (bạn nhớ quay lại video khi mở hộp giúp shop nhé).',
      followUps: ['Phí giao hàng bao nhiêu?', 'Có gói quà & viết thiệp không?', 'Ảnh có giống thực tế không?']
    },
    {
      id: 'gift_wrapping',
      priority: 8,
      phrases: [
        'goi qua',
        'qua tang',
        'viet thiep',
        'tang sinh nhat',
        'tang nguoi yeu',
        'tang ban',
        'hop qua'
      ],
      keywords: ['qua', 'thiep', 'sinh nhat'],
      reply:
        'Dạ có luôn ạ! LUMIÈN hỗ trợ gói hộp quà tinh tế và viết thiệp chúc mừng tay MIỄN PHÍ. Khi đặt hàng, bạn chỉ cần viết lời chúc vào ô "Ghi chú thêm" ở bước thanh toán.\nGợi ý: Bộ Blossom (190.000₫) hoặc Blue mint (190.000₫) kèm thêm 1 hũ nến lẻ 45.000₫ rất sang và thiết thực!',
      followUps: ['Chi tiết mùi Blossom', 'Có bán hũ nến lẻ không?', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'material_real_photo',
      priority: 7,
      phrases: [
        'anh that khong',
        'giong hinh khong',
        'chat lieu gi',
        'kich thuoc',
        'cao bao nhieu',
        'o ngoai giong anh'
      ],
      keywords: ['chat lieu', 'kich thuoc', 'anh that', 'thuy tinh', 'go'],
      reply:
        'Ảnh hiển thị trên website là ảnh thật 100% sản phẩm nhà LUMIÈN ạ! Thân và đế làm từ gỗ tự nhiên mịn đẹp có khắc nơ nhỏ, chao đèn thủy tinh mờ hình hoa chuông tán sáng rất ấm, kích thước gọn xinh (cao khoảng 26–28cm, vừa vặn tab đầu giường hoặc bàn học).',
      followUps: ['1 bộ gồm những gì?', 'Bảo hành đổi trả thế nào?', 'So sánh 3 mùi hương']
    },
    {
      id: 'store_address',
      priority: 8,
      phrases: [
        'dia chi',
        'o dau',
        'cua hang',
        'gio mo cua',
        'may gio dong cua',
        'ghe mua truc tiep',
        'den xem hang'
      ],
      keywords: ['showroom', 'thao dien', 'thu duc', 'mo cua'],
      reply:
        'Cửa hàng LUMIÈN tọa lạc tại:\n• 128 Đường Xuân Thủy, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh.\n• Giờ mở cửa: 08:30 – 21:30 tất cả các ngày (Thứ 2 – Chủ Nhật).\nBạn có thể ghé thử trực tiếp cả 3 bộ đèn (190.000₫) và hũ nến lẻ (45.000₫) nhé!',
      followUps: ['Phí giao hàng bao nhiêu?', 'So sánh 3 mùi hương', 'Gặp nhân viên tư vấn']
    },
    {
      id: 'order_how_track',
      priority: 8,
      suggestContact: true,
      phrases: [
        'cach dat hang',
        'mua nhu the nao',
        'dat hang sao',
        'kiem tra don hang',
        'theo doi don',
        'tra cuu don',
        'huy don',
        'doi dia chi'
      ],
      keywords: ['ma don', 'dat mua', 'dat hang'],
      reply:
        'Để đặt hàng nhanh trong 30 giây: bạn bấm nút "Đặt mua ngay" ở sản phẩm yêu thích -> mở Giỏ hàng -> điền Họ tên, SĐT, Địa chỉ và chọn COD hoặc Chuyển khoản để nhận ngay Mã đơn hàng (LM-...).\nNếu bạn cần kiểm tra hoặc sửa đơn đã đặt, hãy nhập Tên + SĐT + Mã đơn ở khung bên dưới để shop xử lý ngay nhé!',
      followUps: ['Thanh toán thế nào?', 'Phí giao hàng bao nhiêu?', 'Gặp nhân viên tư vấn']
    },
    {
      id: 'candle_care',
      priority: 7,
      phrases: [
        'bao quan nen',
        'meo bao quan',
        'bi lom',
        'cat bac',
        'tat nen',
        'dung ben lau'
      ],
      keywords: ['bao quan', 'lom', 'meo'],
      reply:
        'Mẹo dùng nến thơm LUMIÈN bền và thơm đều hơn:\n• Lần đầu dùng nên bật đèn/thắp khoảng 30–45 phút cho bề mặt sáp ấm chảy đều để tránh bị lõm giữa.\n• Nếu thắp lửa trực tiếp, cắt bấc còn khoảng 5mm trước khi thắp để ngọn lửa êm không có khói.\n• Khi không dùng, đặt nơi thoáng mát tránh nắng chiếu trực tiếp ạ!',
      followUps: ['Dùng được bao lâu?', 'Cách dùng như thế nào?', 'Có bán hũ nến lẻ không?']
    },
    {
      id: 'greeting',
      priority: 2,
      phrases: ['xin chao', 'chao shop', 'shop oi', 'co ai khong', 'tu van giup minh', 'can tu van'],
      keywords: ['hi', 'hello', 'alo', 'chao'],
      reply:
        'Chào bạn ạ! LUMIÈN có 3 bộ Đèn thư giãn nến thơm đuổi muỗi (Ocean, Blue mint, Blossom — 190.000₫) và hũ nến thơm bán lẻ Scented Candle (45.000₫). Bạn đang quan tâm mùi hương, cách dùng hay phí giao hàng ạ?',
      followUps: ['Mùi nào đuổi muỗi tốt nhất?', 'Có bán hũ nến lẻ không?', 'So sánh 3 mùi hương', 'Phí giao hàng bao nhiêu?']
    },
    {
      id: 'thanks_bye',
      priority: 2,
      phrases: ['cam on', 'thank you', 'ok shop', 'tot qua', 'tam biet'],
      keywords: ['thanks', 'thank', 'oke', 'bye'],
      reply:
        'Dạ không có gì ạ! Chúc bạn có những buổi tối thật thư thái và ngủ ngon cùng LUMIÈN. Cần hỗ trợ chọn mùi hay đặt hàng bất cứ lúc nào bạn cứ nhắn lại đây nhé!',
      followUps: ['So sánh 3 mùi hương', 'Có bán hũ nến lẻ không?', 'Gặp nhân viên tư vấn']
    }
  ];

  function scoreIntent(intent, paddedText) {
    let score = 0;

    if (Array.isArray(intent.phrases)) {
      intent.phrases.forEach(function (phrase) {
        if (hasTerm(paddedText, phrase)) {
          score += 5;
        }
      });
    }

    if (Array.isArray(intent.keywords)) {
      intent.keywords.forEach(function (kw) {
        if (hasTerm(paddedText, kw)) {
          score += 2.2;
        }
      });
    }

    return score;
  }

  App.chatbotKB = {
    QUICK_PACKS: QUICK_PACKS,

    getDefaultQuickQuestions: function () {
      return QUICK_PACKS[0].slice();
    },

    match: function (rawMessage) {
      const normalized = normalizeVietnamese(rawMessage);
      if (!normalized) {
        return {
          intentId: 'fallback',
          text: 'Bạn hãy nhập câu hỏi về mùi hương, hũ nến lẻ 45.000₫, bộ đèn 190.000₫ hoặc chọn nhanh câu hỏi gợi ý bên dưới nhé!',
          followUps: QUICK_PACKS[0],
          suggestContact: false
        };
      }

      const padded = ' ' + normalized + ' ';

      const scored = INTENTS.map(function (intent) {
        return {
          intent: intent,
          score: scoreIntent(intent, padded)
        };
      })
        .filter(function (entry) {
          return entry.score > 0;
        })
        .sort(function (a, b) {
          if (b.score !== a.score) return b.score - a.score;
          return (b.intent.priority || 0) - (a.intent.priority || 0);
        });

      if (scored.length === 0) {
        return {
          intentId: 'fallback',
          text:
            'Cảm ơn bạn đã nhắn cho LUMIÈN! Mình chưa hiểu rõ ý bạn lắm — bạn có thể bấm chọn các câu hỏi gợi ý bên dưới (về mùi hương, hũ nến lẻ 45.000₫, bộ đèn 190.000₫, giao hàng, bảo hành...) hoặc để lại Tên & SĐT ngay dưới để nhân viên gọi tư vấn trực tiếp nhé!',
          followUps: ['So sánh 3 mùi hương', 'Có bán hũ nến lẻ không?', 'Phí giao hàng bao nhiêu?', 'Gặp nhân viên tư vấn'],
          suggestContact: false
        };
      }

      const primary = scored[0];
      const secondary = scored[1];

      const canCombine =
        secondary &&
        primary.intent.id !== 'greeting' &&
        primary.intent.id !== 'thanks_bye' &&
        primary.intent.id !== 'human_agent' &&
        secondary.intent.id !== 'greeting' &&
        secondary.intent.id !== 'thanks_bye' &&
        secondary.score >= 4 &&
        secondary.score >= primary.score * 0.5;

      if (canCombine) {
        return {
          intentId: primary.intent.id + '+' + secondary.intent.id,
          text: primary.intent.reply + '\n\n' + secondary.intent.reply,
          followUps: primary.intent.followUps || QUICK_PACKS[0],
          suggestContact: Boolean(primary.intent.suggestContact || secondary.intent.suggestContact)
        };
      }

      return {
        intentId: primary.intent.id,
        text: primary.intent.reply,
        followUps: primary.intent.followUps || QUICK_PACKS[0],
        suggestContact: Boolean(primary.intent.suggestContact)
      };
    }
  };
})(window);
