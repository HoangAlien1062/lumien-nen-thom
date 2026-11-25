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
    phone: contact.phone || '0908 682 468',
    phoneHref: contact.phoneHref || 'tel:0908682468',
    zaloUrl: contact.zaloUrl || 'https://zalo.me/0908682468',
    facebookUrl: contact.facebookUrl || 'https://facebook.com',
    email: contact.email || 'hello@lumien.vn',
    address: contact.address || '128 Đường Xuân Thủy, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
    hours: contact.hours || 'Thứ 2 – Chủ Nhật: 08:30 – 21:30',
    shippingFee: typeof cfg.shippingFee === 'number' ? cfg.shippingFee : 25000,
    freeShippingThreshold: cfg.freeShippingThreshold || 2
  };

  App.PRODUCTS = [
    {
      id: 'ocean',
      slug: 'ocean',
      name: 'Ocean',
      subtitle: 'Hương Biển Mát Lành · Thư Thái',
      badge: 'Thư thái nhẹ dịu',
      price: 200000,
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
        { label: 'Công dụng chính', value: 'Thư giãn & xua muỗi dịu nhẹ' },
        { label: 'Ánh sáng đèn', value: 'Vàng ấm 2700K êm mắt' },
        { label: 'Thời gian tỏa hương', value: '35 – 40 giờ sử dụng' },
        { label: 'Không gian phù hợp', value: 'Phòng 15 – 25 m²' }
      ]
    },
    {
      id: 'blue-mint',
      slug: 'blue-mint',
      name: 'Blue mint',
      subtitle: 'Hương Bạc Hà Tươi Mát · Sảng Khoái',
      badge: 'Đuổi muỗi tối ưu',
      price: 200000,
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
        { label: 'Công dụng chính', value: 'Đuổi muỗi hiệu quả & thoáng khí' },
        { label: 'Ánh sáng đèn', value: 'Vàng ấm 2700K êm mắt' },
        { label: 'Thời gian tỏa hương', value: '35 – 40 giờ sử dụng' },
        { label: 'Không gian phù hợp', value: 'Phòng 15 – 25 m²' }
      ]
    },
    {
      id: 'blossom',
      slug: 'blossom',
      name: 'Blossom',
      subtitle: 'Hương Hoa Dịu Ngọt · Ấm Áp',
      badge: 'Dễ ngủ sâu giấc',
      price: 200000,
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
        { label: 'Công dụng chính', value: 'Thư giãn trước ngủ & xua muỗi êm' },
        { label: 'Ánh sáng đèn', value: 'Vàng ấm 2700K êm mắt' },
        { label: 'Thời gian tỏa hương', value: '35 – 40 giờ sử dụng' },
        { label: 'Không gian phù hợp', value: 'Phòng 15 – 25 m²' }
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
    'Đèn dùng điện hay pin?',
    'Phí giao hàng bao nhiêu?',
    'Gặp nhân viên tư vấn'
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
