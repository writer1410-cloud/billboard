import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function calcTotals(items: { quantity: number; unitPrice: number; [key: string]: unknown }[], taxRate = 0.1) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== 'portfolio2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.reminder.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.client.deleteMany();

  const [creative, blue, front, next, green, tanaka] = await Promise.all([
    prisma.client.create({ data: { name: '株式会社クリエイティブラボ', email: 'info@creative-lab.co.jp', phone: '03-5678-1234', address: '東京都渋谷区神南1-2-3 クリエイティブビル4F', createdAt: daysAgo(180) } }),
    prisma.client.create({ data: { name: '合同会社ブルーオーシャン', email: 'contact@blueocean-llc.jp', phone: '06-4321-8765', address: '大阪府大阪市中央区本町2-4-6', createdAt: daysAgo(150) } }),
    prisma.client.create({ data: { name: '株式会社フロントライン', email: 'pr@frontline-inc.jp', phone: '052-987-6543', address: '愛知県名古屋市中区栄3-1-5 フロントラインビル2F', createdAt: daysAgo(120) } }),
    prisma.client.create({ data: { name: '株式会社ネクストビジョン', email: 'dev@nextvision.co.jp', phone: '03-1111-2222', address: '東京都港区六本木7-8-9', createdAt: daysAgo(90) } }),
    prisma.client.create({ data: { name: 'NPO法人グリーンアース', email: 'office@green-earth.or.jp', phone: '075-333-4444', address: '京都府京都市下京区烏丸通1-2', createdAt: daysAgo(60) } }),
    prisma.client.create({ data: { name: '田中工務店', email: 'tanaka@tanaka-koumuten.jp', phone: '045-555-6666', address: '神奈川県横浜市中区山下町88', createdAt: daysAgo(30) } }),
  ]);

  // Quotes
  const q1Items = [
    { description: 'コーポレートサイト デザイン（PC・SP）', quantity: 1, unitPrice: 280000, amount: 280000, sortOrder: 0 },
    { description: 'フロントエンド実装', quantity: 1, unitPrice: 220000, amount: 220000, sortOrder: 1 },
    { description: 'CMS（WordPress）導入・設定', quantity: 1, unitPrice: 80000, amount: 80000, sortOrder: 2 },
    { description: '保守・運用サポート（初月）', quantity: 1, unitPrice: 20000, amount: 20000, sortOrder: 3 },
  ];
  const q1 = await prisma.quote.create({ data: { quoteNumber: 'Q-2025-001', clientId: creative.id, title: 'コーポレートサイト全面リニューアル', ...calcTotals(q1Items), validUntil: daysAgo(60), status: 'ACCEPTED', sentAt: daysAgo(100), createdAt: daysAgo(105), items: { create: q1Items } } });

  const q2Items = [
    { description: 'ブランドロゴ デザイン（案3点提案）', quantity: 1, unitPrice: 120000, amount: 120000, sortOrder: 0 },
    { description: 'ブランドカラー・タイポグラフィ策定', quantity: 1, unitPrice: 40000, amount: 40000, sortOrder: 1 },
    { description: 'ブランドガイドライン PDF作成', quantity: 1, unitPrice: 40000, amount: 40000, sortOrder: 2 },
  ];
  const q2 = await prisma.quote.create({ data: { quoteNumber: 'Q-2025-002', clientId: blue.id, title: 'ブランドアイデンティティ構築', ...calcTotals(q2Items), validUntil: daysAgo(80), status: 'ACCEPTED', sentAt: daysAgo(130), createdAt: daysAgo(135), items: { create: q2Items } } });

  await prisma.quote.create({ data: { quoteNumber: 'Q-2025-003', clientId: front.id, title: 'ECサイト新規構築', ...calcTotals([{ description: 'ECサイト設計・UXリサーチ', quantity: 1, unitPrice: 150000, amount: 150000, sortOrder: 0 }, { description: 'UIデザイン', quantity: 1, unitPrice: 320000, amount: 320000, sortOrder: 1 }, { description: 'Shopify テーマカスタマイズ', quantity: 1, unitPrice: 200000, amount: 200000, sortOrder: 2 }, { description: '決済・在庫連携設定', quantity: 1, unitPrice: 80000, amount: 80000, sortOrder: 3 }]), validUntil: daysFromNow(14), status: 'SENT', sentAt: daysAgo(10), createdAt: daysAgo(12), items: { create: [{ description: 'ECサイト設計・UXリサーチ', quantity: 1, unitPrice: 150000, amount: 150000, sortOrder: 0 }, { description: 'UIデザイン', quantity: 1, unitPrice: 320000, amount: 320000, sortOrder: 1 }, { description: 'Shopify テーマカスタマイズ', quantity: 1, unitPrice: 200000, amount: 200000, sortOrder: 2 }, { description: '決済・在庫連携設定', quantity: 1, unitPrice: 80000, amount: 80000, sortOrder: 3 }] } } });

  await prisma.quote.create({ data: { quoteNumber: 'Q-2025-004', clientId: next.id, title: 'モバイルアプリ UIデザイン', ...calcTotals([{ description: 'スマートフォンアプリ UIデザイン', quantity: 1, unitPrice: 450000, amount: 450000, sortOrder: 0 }, { description: 'プロトタイプ作成（Figma）', quantity: 1, unitPrice: 80000, amount: 80000, sortOrder: 1 }, { description: 'ユーザーテスト実施・改善', quantity: 2, unitPrice: 50000, amount: 100000, sortOrder: 2 }]), validUntil: daysFromNow(30), status: 'DRAFT', createdAt: daysAgo(3), items: { create: [{ description: 'スマートフォンアプリ UIデザイン', quantity: 1, unitPrice: 450000, amount: 450000, sortOrder: 0 }, { description: 'プロトタイプ作成（Figma）', quantity: 1, unitPrice: 80000, amount: 80000, sortOrder: 1 }, { description: 'ユーザーテスト実施・改善', quantity: 2, unitPrice: 50000, amount: 100000, sortOrder: 2 }] } } });

  await prisma.quote.create({ data: { quoteNumber: 'Q-2025-005', clientId: green.id, title: '寄付募集ランディングページ制作', ...calcTotals([{ description: 'LP デザイン', quantity: 1, unitPrice: 90000, amount: 90000, sortOrder: 0 }, { description: 'HTML/CSS コーディング', quantity: 1, unitPrice: 60000, amount: 60000, sortOrder: 1 }]), validUntil: daysAgo(15), status: 'EXPIRED', sentAt: daysAgo(50), createdAt: daysAgo(52), items: { create: [{ description: 'LP デザイン', quantity: 1, unitPrice: 90000, amount: 90000, sortOrder: 0 }, { description: 'HTML/CSS コーディング', quantity: 1, unitPrice: 60000, amount: 60000, sortOrder: 1 }] } } });

  await prisma.quote.create({ data: { quoteNumber: 'Q-2025-006', clientId: tanaka.id, title: '会社案内パンフレット制作', ...calcTotals([{ description: '会社案内パンフレット デザイン（A4・8P）', quantity: 1, unitPrice: 180000, amount: 180000, sortOrder: 0 }, { description: 'DTP・印刷データ入稿', quantity: 1, unitPrice: 30000, amount: 30000, sortOrder: 1 }]), validUntil: daysAgo(20), status: 'REJECTED', sentAt: daysAgo(45), createdAt: daysAgo(47), items: { create: [{ description: '会社案内パンフレット デザイン（A4・8P）', quantity: 1, unitPrice: 180000, amount: 180000, sortOrder: 0 }, { description: 'DTP・印刷データ入稿', quantity: 1, unitPrice: 30000, amount: 30000, sortOrder: 1 }] } } });

  await prisma.quote.create({ data: { quoteNumber: 'Q-2025-007', clientId: creative.id, title: 'SNS広告クリエイティブ制作', ...calcTotals([{ description: 'SNS広告バナー制作（Instagram・X 各5種）', quantity: 10, unitPrice: 15000, amount: 150000, sortOrder: 0 }, { description: 'コピーライティング', quantity: 10, unitPrice: 5000, amount: 50000, sortOrder: 1 }]), validUntil: daysFromNow(21), status: 'SENT', sentAt: daysAgo(4), createdAt: daysAgo(5), items: { create: [{ description: 'SNS広告バナー制作（Instagram・X 各5種）', quantity: 10, unitPrice: 15000, amount: 150000, sortOrder: 0 }, { description: 'コピーライティング', quantity: 10, unitPrice: 5000, amount: 50000, sortOrder: 1 }] } } });

  // Invoices
  const i1Items = [{ description: 'コーポレートサイト デザイン（PC・SP）', quantity: 1, unitPrice: 280000, amount: 280000, sortOrder: 0 }, { description: 'フロントエンド実装', quantity: 1, unitPrice: 220000, amount: 220000, sortOrder: 1 }, { description: 'CMS（WordPress）導入・設定', quantity: 1, unitPrice: 80000, amount: 80000, sortOrder: 2 }, { description: '保守・運用サポート（初月）', quantity: 1, unitPrice: 20000, amount: 20000, sortOrder: 3 }];
  await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-001', clientId: creative.id, quoteId: q1.id, title: 'コーポレートサイト全面リニューアル', ...calcTotals(i1Items), issueDate: daysAgo(90), dueDate: daysAgo(60), status: 'PAID', paidAt: daysAgo(58), sentAt: daysAgo(90), createdAt: daysAgo(90), items: { create: i1Items } } });

  const i2Items = [{ description: 'ブランドロゴ デザイン（案3点提案）', quantity: 1, unitPrice: 120000, amount: 120000, sortOrder: 0 }, { description: 'ブランドカラー・タイポグラフィ策定', quantity: 1, unitPrice: 40000, amount: 40000, sortOrder: 1 }, { description: 'ブランドガイドライン PDF作成', quantity: 1, unitPrice: 40000, amount: 40000, sortOrder: 2 }];
  await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-002', clientId: blue.id, quoteId: q2.id, title: 'ブランドアイデンティティ構築', ...calcTotals(i2Items), issueDate: daysAgo(110), dueDate: daysAgo(80), status: 'PAID', paidAt: daysAgo(75), sentAt: daysAgo(110), createdAt: daysAgo(110), items: { create: i2Items } } });

  await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-003', clientId: front.id, title: 'メールマガジン テンプレート制作', ...calcTotals([{ description: 'メールマガジン テンプレートデザイン（HTML）', quantity: 3, unitPrice: 35000, amount: 105000, sortOrder: 0 }, { description: '配信システム設定（Mailchimp）', quantity: 1, unitPrice: 25000, amount: 25000, sortOrder: 1 }]), issueDate: daysAgo(75), dueDate: daysAgo(45), status: 'PAID', paidAt: daysAgo(42), sentAt: daysAgo(75), createdAt: daysAgo(75), items: { create: [{ description: 'メールマガジン テンプレートデザイン（HTML）', quantity: 3, unitPrice: 35000, amount: 105000, sortOrder: 0 }, { description: '配信システム設定（Mailchimp）', quantity: 1, unitPrice: 25000, amount: 25000, sortOrder: 1 }] } } });

  await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-004', clientId: next.id, title: '採用サイト リニューアル', ...calcTotals([{ description: '採用サイト UIデザイン', quantity: 1, unitPrice: 160000, amount: 160000, sortOrder: 0 }, { description: 'コーディング（React）', quantity: 1, unitPrice: 140000, amount: 140000, sortOrder: 1 }]), issueDate: daysAgo(60), dueDate: daysAgo(30), status: 'PAID', paidAt: daysAgo(28), sentAt: daysAgo(60), createdAt: daysAgo(60), items: { create: [{ description: '採用サイト UIデザイン', quantity: 1, unitPrice: 160000, amount: 160000, sortOrder: 0 }, { description: 'コーディング（React）', quantity: 1, unitPrice: 140000, amount: 140000, sortOrder: 1 }] } } });

  const inv5 = await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-005', clientId: creative.id, title: '月次保守・コンテンツ更新（4月分）', ...calcTotals([{ description: 'Webサイト 月次保守・更新作業', quantity: 1, unitPrice: 30000, amount: 30000, sortOrder: 0 }, { description: 'コンテンツ追加（ブログ記事 4本）', quantity: 4, unitPrice: 8000, amount: 32000, sortOrder: 1 }]), issueDate: daysAgo(50), dueDate: daysAgo(20), status: 'OVERDUE', sentAt: daysAgo(50), createdAt: daysAgo(50), items: { create: [{ description: 'Webサイト 月次保守・更新作業', quantity: 1, unitPrice: 30000, amount: 30000, sortOrder: 0 }, { description: 'コンテンツ追加（ブログ記事 4本）', quantity: 4, unitPrice: 8000, amount: 32000, sortOrder: 1 }] } } });
  await prisma.reminder.create({ data: { invoiceId: inv5.id, sentAt: daysAgo(10), type: 'OVERDUE' } });

  const inv6 = await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-006', clientId: blue.id, title: 'Web広告バナー制作', ...calcTotals([{ description: 'バナー広告デザイン（Web用 各種サイズ）', quantity: 8, unitPrice: 12000, amount: 96000, sortOrder: 0 }, { description: '修正対応（2ラウンド）', quantity: 1, unitPrice: 16000, amount: 16000, sortOrder: 1 }]), issueDate: daysAgo(65), dueDate: daysAgo(35), status: 'OVERDUE', sentAt: daysAgo(65), createdAt: daysAgo(65), items: { create: [{ description: 'バナー広告デザイン（Web用 各種サイズ）', quantity: 8, unitPrice: 12000, amount: 96000, sortOrder: 0 }, { description: '修正対応（2ラウンド）', quantity: 1, unitPrice: 16000, amount: 16000, sortOrder: 1 }] } } });
  await prisma.reminder.createMany({ data: [{ invoiceId: inv6.id, sentAt: daysAgo(25), type: 'OVERDUE' }, { invoiceId: inv6.id, sentAt: daysAgo(10), type: 'OVERDUE' }] });

  await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-007', clientId: front.id, title: '商品撮影・レタッチ', ...calcTotals([{ description: '商品撮影 ディレクション', quantity: 1, unitPrice: 50000, amount: 50000, sortOrder: 0 }, { description: '写真レタッチ・納品（50カット）', quantity: 50, unitPrice: 1500, amount: 75000, sortOrder: 1 }]), issueDate: daysAgo(20), dueDate: daysFromNow(10), status: 'UNPAID', sentAt: daysAgo(20), createdAt: daysAgo(20), items: { create: [{ description: '商品撮影 ディレクション', quantity: 1, unitPrice: 50000, amount: 50000, sortOrder: 0 }, { description: '写真レタッチ・納品（50カット）', quantity: 50, unitPrice: 1500, amount: 75000, sortOrder: 1 }] } } });

  await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-008', clientId: next.id, title: '会社紹介動画 制作', ...calcTotals([{ description: '会社紹介動画 編集・アニメーション（3分）', quantity: 1, unitPrice: 200000, amount: 200000, sortOrder: 0 }, { description: 'BGM・効果音 ライセンス費用', quantity: 1, unitPrice: 15000, amount: 15000, sortOrder: 1 }, { description: 'テロップ・字幕制作', quantity: 1, unitPrice: 35000, amount: 35000, sortOrder: 2 }]), issueDate: daysAgo(15), dueDate: daysFromNow(15), status: 'UNPAID', sentAt: daysAgo(15), createdAt: daysAgo(15), items: { create: [{ description: '会社紹介動画 編集・アニメーション（3分）', quantity: 1, unitPrice: 200000, amount: 200000, sortOrder: 0 }, { description: 'BGM・効果音 ライセンス費用', quantity: 1, unitPrice: 15000, amount: 15000, sortOrder: 1 }, { description: 'テロップ・字幕制作', quantity: 1, unitPrice: 35000, amount: 35000, sortOrder: 2 }] } } });

  await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-009', clientId: green.id, title: 'アクセシビリティ改善対応', ...calcTotals([{ description: 'Webサイト アクセシビリティ監査・改善', quantity: 1, unitPrice: 80000, amount: 80000, sortOrder: 0 }, { description: 'WCAG 2.1 AA 対応実装', quantity: 1, unitPrice: 120000, amount: 120000, sortOrder: 1 }]), issueDate: daysAgo(5), dueDate: daysFromNow(25), status: 'UNPAID', sentAt: daysAgo(5), createdAt: daysAgo(5), items: { create: [{ description: 'Webサイト アクセシビリティ監査・改善', quantity: 1, unitPrice: 80000, amount: 80000, sortOrder: 0 }, { description: 'WCAG 2.1 AA 対応実装', quantity: 1, unitPrice: 120000, amount: 120000, sortOrder: 1 }] } } });

  await prisma.invoice.create({ data: { invoiceNumber: 'INV-2025-010', clientId: tanaka.id, title: 'アプリ UI画面デザイン', ...calcTotals([{ description: 'スマホアプリ スプラッシュ・オンボーディング画面', quantity: 5, unitPrice: 40000, amount: 200000, sortOrder: 0 }]), issueDate: daysAgo(40), dueDate: daysAgo(10), status: 'CANCELLED', sentAt: daysAgo(40), createdAt: daysAgo(40), items: { create: [{ description: 'スマホアプリ スプラッシュ・オンボーディング画面', quantity: 5, unitPrice: 40000, amount: 200000, sortOrder: 0 }] } } });

  return NextResponse.json({
    message: 'サンプルデータを投入しました',
    summary: {
      clients: 6,
      quotes: 7,
      invoices: 10,
      reminders: 3,
    },
  });
}
