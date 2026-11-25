/* ==========================================================================
   LUMIÈN — Catalog Data, Status Definitions & Chat Quick Replies
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});
  const cfg = App.CONFIG || {};
  const contact = cfg.contact || {};

  App.STORE_INFO = {
    brandName: cfg.brandName || 'LUMIÈN',
    tagline: cfg.tagline || 'Ánh sáng & Hương thơm',
    phone: contact.phone || '0397 133 716',
    phoneHref: contact.phoneHref || 'tel:0397133716',
    zaloUrl: contact.zaloUrl || 'https://zalo.me/0397133716',
    facebookUrl: contact.facebookUrl || 'https://facebook.com',
    email: contact.email || 'hello@lumien.vn',
    address: contact.address || '128 Đường Xuân Thủy, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
    hours: contact.hours || 'Thứ 2 – Chủ Nhật: 08:30 – 21:30',
    shippingFee: typeof cfg.shippingFee === 'number' ? cfg.shippingFee : 25000,
    freeShippingMinAmount: typeof cfg.freeShippingMinAmount === 'number' ? cfg.freeShippingMinAmount : 350000
  };

  App.PRODUCTS = [
    {
      id: 'ocean',
      slug: 'ocean',
      name: 'Ocean',
      subtitle: 'Đèn & Nến · Hương Biển Mát Lành',
      badge: 'Thư thái nhẹ dịu',
      stockLabel: 'Sẵn hàng · Trọn bộ đèn & nến',
      price: 190000,
      image: './images/ocean.jpg',
      placeholderVariant: 'ocean',
      placeholderCaption: 'Hương biển sớm & sả nhẹ',
      shortDesc:
        'Hương biển mát lành như làn gió sớm, xoa dịu căng thẳng sau ngày dài và xua muỗi nhẹ dịu, dễ chịu suốt giấc ngủ.',
      fullDesc:
        'Phiên bản Ocean kết hợp đèn gỗ chao hoa chuông ánh sáng vàng ấm 2700K cùng hũ nến gel xanh đại dương mang hương biển thanh khiết, gỗ lũa dịu nhẹ và tinh dầu sả tự nhiên. Không gian trở nên thoáng đãng, thư thái mà vẫn xua muỗi êm dịu suốt đêm.',
      notes: ['Muối biển', 'Gỗ lũa dịu', 'Sả tự nhiên'],
      scentPyramid: {
        top: 'Gió biển mát lành, vỏ cam bergamot nhẹ',
        heart: 'Muối biển khoáng đạt, tinh dầu sả chanh dịu',
        base: 'Gỗ lũa ấm, xạ hương trắng êm ái'
      },
      specs: [
        { label: 'Quy cách', value: 'Trọn bộ đèn gỗ + hũ nến' },
        { label: 'Ánh sáng đèn', value: 'Vàng ấm 2700K êm mắt' },
        { label: 'Thời gian tỏa hương', value: '35 – 40 giờ sử dụng' },
        { label: 'Không gian phù hợp', value: 'Phòng 15 – 25 m²' }
      ]
    },
    {
      id: 'blue-mint',
      slug: 'blue-mint',
      name: 'Blue mint',
      subtitle: 'Đèn & Nến · Hương Bạc Hà Tươi Mát',
      badge: 'Đuổi muỗi tối ưu',
      stockLabel: 'Sẵn hàng · Trọn bộ đèn & nến',
      price: 190000,
      image: './images/blue-mint.jpg',
      placeholderVariant: 'blue-mint',
      placeholderCaption: 'Bạc hà Âu & bạch đàn tươi',
      shortDesc:
        'Hương bạc hà tươi mát, sảng khoái giúp làm thoáng không gian phòng ngủ và đuổi muỗi hiệu quả suốt đêm dài.',
      fullDesc:
        'Blue mint là lựa chọn lý tưởng cho những ngày ẩm nóng hoặc gia đình muốn tối ưu hiệu quả xua muỗi. Tinh dầu bạc hà Âu hòa cùng lá bạch đàn và vỏ chanh tươi giúp thanh lọc không khí, đi kèm thiết kế hũ nến hoa xanh nơ lụa tinh khôi dưới ánh đèn vàng ấm.',
      notes: ['Bạc hà Âu', 'Lá bạch đàn', 'Vỏ chanh tươi'],
      scentPyramid: {
        top: 'Lá bạc hà Âu tươi mát, vỏ chanh xanh',
        heart: 'Tinh dầu bạch đàn, thảo mộc sả thanh',
        base: 'Trà xanh dịu nhẹ, gỗ tuyết tùng mềm'
      },
      specs: [
        { label: 'Quy cách', value: 'Trọn bộ đèn gỗ + hũ nến' },
        { label: 'Ánh sáng đèn', value: 'Vàng ấm 2700K êm mắt' },
        { label: 'Thời gian tỏa hương', value: '35 – 40 giờ sử dụng' },
        { label: 'Không gian phù hợp', value: 'Phòng 15 – 25 m²' }
      ]
    },
    {
      id: 'blossom',
      slug: 'blossom',
      name: 'Blossom',
      subtitle: 'Đèn & Nến · Hương Hoa Dịu Ngọt',
      badge: 'Dễ ngủ sâu giấc',
      stockLabel: 'Sẵn hàng · Trọn bộ đèn & nến',
      price: 190000,
      image: './images/blossom.jpg',
      placeholderVariant: 'blossom',
      placeholderCaption: 'Hoa nhài, mẫu đơn & oải hương',
      shortDesc:
        'Hương hoa dịu ngọt, ấm áp và tinh tế, vỗ về cảm xúc để bạn thư giãn sâu trước khi chìm vào giấc ngủ ngon.',
      fullDesc:
        'Blossom mang đến cảm giác dịu dàng, ấm cúng với cánh hoa hồng phớt trong suốt lung linh dưới ánh đèn hoa chuông. Sự giao thoa giữa hoa nhài, mẫu đơn ngọt thanh cùng oải hương thiên nhiên vừa hỗ trợ dễ ngủ sâu, vừa xua muỗi quanh giường một cách êm ái.',
      notes: ['Hoa nhài', 'Mẫu đơn', 'Oải hương'],
      scentPyramid: {
        top: 'Cánh hoa mẫu đơn mềm mại, đào trắng thanh',
        heart: 'Hoa nhài đêm, tinh dầu oải hương xua muỗi',
        base: 'Vani kem ấm áp, gỗ đàn hương dịu'
      },
      specs: [
        { label: 'Quy cách', value: 'Trọn bộ đèn gỗ + hũ nến' },
        { label: 'Ánh sáng đèn', value: 'Vàng ấm 2700K êm mắt' },
        { label: 'Thời gian tỏa hương', value: '35 – 40 giờ sử dụng' },
        { label: 'Không gian phù hợp', value: 'Phòng 15 – 25 m²' }
      ]
    },
    {
      id: 'scented-candle',
      slug: 'scented-candle',
      name: 'Scented Candle',
      subtitle: 'Hũ Nến Thơm Đuổi Muỗi · Bán Lẻ',
      badge: 'Nến lẻ · Thay thế',
      stockLabel: 'Sẵn hàng · Hũ nến bán lẻ',
      price: 45000,
      image: './images/scented-candle.jpg',
      placeholderVariant: 'scented-candle',
      placeholderCaption: 'Sáp kem ấm & tinh dầu thảo mộc',
      shortDesc:
        'Hũ nến thơm sáp thực vật bán lẻ với hương gỗ ấm, vani dịu và tinh dầu sả xua muỗi — thắp trực tiếp hoặc thay thế cho đèn ngủ LUMIÈN.',
      fullDesc:
        'Scented Candle phiên bản hũ thủy tinh trong suốt tối giản là lựa chọn tiết kiệm khi bạn muốn mua thêm nến thay thế cho đèn LUMIÈN hoặc thắp thư giãn lẻ trên bàn làm việc. Sáp đậu nành kem mịn không khói đen, tỏa hương gỗ ấm hòa vani dịu và tinh dầu sả chanh xua muỗi nhẹ nhàng.',
      notes: ['Gỗ ấm dịu', 'Vani kem', 'Sả chanh nhẹ'],
      scentPyramid: {
        top: 'Sả chanh thanh dịu, cam ngọt nhẹ',
        heart: 'Gỗ tuyết tùng mềm, hoa trắng tinh khôi',
        base: 'Vani kem ấm áp, xạ hương dịu êm'
      },
      specs: [
        { label: 'Quy cách', value: '01 hũ nến thủy tinh (không kèm đèn)' },
        { label: 'Thành phần', value: 'Sáp đậu nành & tinh dầu tự nhiên' },
        { label: 'Thời gian tỏa hương', value: '25 – 30 giờ sử dụng' },
        { label: 'Tương thích', value: 'Thắp lẻ hoặc đặt dưới đèn LUMIÈN' }
      ]
    }
  ];

  App.ORDER_STATUSES = [
    { value: 'new', label: 'Mới đặt', tone: 'gold' },
    { value: 'confirmed', label: 'Đã xác nhận', tone: 'blue' },
    { value: 'shipping', label: 'Đang giao', tone: 'amber' },
    { value: 'completed', label: 'Hoàn thành', tone: 'green' },
    { value: 'cancelled', label: 'Đã hủy', tone: 'muted' }
  ];

  App.LEAD_STATUSES = [
    { value: 'pending', label: 'Chờ phản hồi', tone: 'gold' },
    { value: 'replied', label: 'Đã liên hệ', tone: 'green' }
  ];

  App.CHAT_QUICK_QUESTIONS = [
    'Mùi nào đuổi muỗi tốt nhất?',
    '1 bộ gồm những gì?',
    'Có bán hũ nến lẻ không?',
    'Phí giao hàng bao nhiêu?'
  ];

  App.formatVND = function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN').format(Number(amount) || 0) + '₫';
  };

  App.getProductById = function getProductById(id) {
    return (
      App.PRODUCTS.find(function (item) {
        return item.id === id;
      }) || null
    );
  };
})(window);
