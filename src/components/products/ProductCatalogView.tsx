'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ProductItem, Language } from '@/types';
import { dictionaries } from '@/lib/i18n/translations';
import { WhatsAppIcon } from '@/components/icons/SocialIcons';
import { Search, Tag, Eye, X, CheckCircle2, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';

interface ProductCatalogViewProps {
  products: ProductItem[];
  lang: Language;
}

export function ProductCatalogView({ products, lang }: ProductCatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<ProductItem | null>(null);

  const isRtl = lang === 'ar';
  const dict = dictionaries[lang];

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Filtered products based on search & category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name_en.toLowerCase().includes(q) ||
        product.name_ar.toLowerCase().includes(q) ||
        product.brand_en.toLowerCase().includes(q) ||
        product.brand_ar.toLowerCase().includes(q) ||
        product.description_en.toLowerCase().includes(q) ||
        product.description_ar.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Build WhatsApp enquiry URL with product details
  const getWhatsAppUrl = (product: ProductItem) => {
    const productName = isRtl ? product.name_ar : product.name_en;
    const productBrand = isRtl ? product.brand_ar : product.brand_en;
    const price = isRtl ? product.price_ar : product.price_en;

    const message = isRtl
      ? `مرحباً سبيدر سبايدر دبي! أرغب في الاستفسار عن المنتج التالي المعروض في موقعكم:
• اسم المنتج: ${productName}
• العلامة التجارية: ${productBrand}
• السعر: ${price}

هل يمكنكم تزويدي بتفاصيل التوافر وموعد التركيب في الورشة؟ شكراً لكم!`
      : `Hello SpeederSpider Dubai! I am interested in enquiring about the following product from your catalogue:
• Product: ${productName}
• Brand: ${productBrand}
• Price: ${price}

Could you please share availability, pricing options, and workshop installation details? Thank you!`;

    return `https://wa.me/971565694440?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-12">
      {/* Search and Category Filter Bar */}
      <div className="bg-brand-navy/60 backdrop-blur-md border border-brand-steelBlue/40 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cyan/70 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.products.searchPlaceholder}
              className={`w-full py-2.5 rounded-xl bg-brand-deepNavy/80 border border-brand-steelBlue/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white ${isRtl ? 'left-3' : 'right-3'}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-brand-cyan text-brand-deepNavy font-bold shadow-[0_0_15px_rgba(91,192,222,0.4)]'
                  : 'bg-brand-deepNavy/80 text-gray-300 hover:text-white border border-brand-steelBlue/40 hover:border-brand-cyan/50'
              }`}
            >
              {dict.products.allProducts} ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-brand-cyan text-brand-deepNavy font-bold shadow-[0_0_15px_rgba(91,192,222,0.4)]'
                    : 'bg-brand-deepNavy/80 text-gray-300 hover:text-white border border-brand-steelBlue/40 hover:border-brand-cyan/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-brand-navy/30 border border-brand-steelBlue/30 rounded-2xl p-8 space-y-4">
          <SlidersHorizontal className="w-12 h-12 text-gray-500 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white font-display">
            {dict.products.noProductsFound}
          </h3>
          <p className="text-sm text-gray-400">
            {isRtl
              ? 'يرجى تجربة كلمات بحث أخرى أو إزالة عامل التصفية.'
              : 'Please try searching for another term or clear the filter.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan border border-brand-cyan/50 rounded-lg hover:bg-brand-cyan/10 transition-colors"
          >
            {isRtl ? 'إعادة ضبط البحث' : 'Reset Search'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const title = isRtl ? product.name_ar : product.name_en;
            const subtitle = isRtl ? product.name_en : product.name_ar;
            const brand = isRtl ? product.brand_ar : product.brand_en;
            const desc = isRtl ? product.description_ar : product.description_en;
            const price = isRtl ? product.price_ar : product.price_en;
            const waUrl = getWhatsAppUrl(product);

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-cyan/70 transition-all duration-300 hover:shadow-[0_10px_35px_rgba(91,192,222,0.2)] hover:-translate-y-1"
              >
                {/* Image Container with Badges */}
                <div
                  className="relative aspect-square w-full overflow-hidden bg-brand-deepNavy/90 cursor-pointer p-4 flex items-center justify-center"
                  onClick={() => setActiveModalProduct(product)}
                >
                  <Image
                    src={product.image_url}
                    alt={title}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                  {/* Brand Tag Badge */}
                  <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-deepNavy/85 backdrop-blur-md border border-brand-steelBlue/60 text-[11px] font-mono font-bold text-brand-cyan shadow-md`}>
                    <Tag className="w-3 h-3" />
                    <span>{brand}</span>
                  </div>

                  {/* Quick View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalProduct(product);
                    }}
                    className={`absolute bottom-3 ${isRtl ? 'left-3' : 'right-3'} z-10 p-2 rounded-lg bg-brand-deepNavy/90 backdrop-blur-md border border-brand-steelBlue/50 text-gray-300 hover:text-white hover:border-brand-cyan transition-all opacity-0 group-hover:opacity-100 shadow-md`}
                    title={isRtl ? 'معاينة سريعة' : 'Quick View'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Category Label */}
                    {product.category && (
                      <span className="text-[10px] uppercase tracking-wider font-mono text-brand-cyan/80 block">
                        {product.category}
                      </span>
                    )}

                    {/* Product Name */}
                    <h2
                      onClick={() => setActiveModalProduct(product)}
                      className="text-base sm:text-lg font-bold text-white font-display group-hover:text-brand-cyan transition-colors line-clamp-1 cursor-pointer"
                      title={title}
                    >
                      {title}
                    </h2>
                    {subtitle && subtitle !== title && (
                      <p className="text-xs text-gray-400 font-sans line-clamp-1 opacity-70">
                        {subtitle}
                      </p>
                    )}

                    {/* Short Description */}
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 pt-1">
                      {desc}
                    </p>
                  </div>

                  {/* Price & WhatsApp CTA */}
                  <div className="pt-4 border-t border-brand-steelBlue/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-mono text-[11px]">
                        {dict.products.priceLabel}:
                      </span>
                      <span className="font-mono font-bold text-brand-cyan px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-xs">
                        {price}
                      </span>
                    </div>

                    {/* Primary WhatsApp Action Button */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_15px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                      title={`WhatsApp: ${title}`}
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                      <span>{dict.products.enquireWhatsApp}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Workshop Installation & Assurance Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-navy via-brand-steelBlue/20 to-brand-navy border border-brand-cyan/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-xs font-mono font-bold text-brand-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تركيب وضمان الورشة' : 'Workshop Installation & Warranty'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            {isRtl
              ? 'هل تحتاج إلى تركيب مخصص داخل ورشتنا في دبي؟'
              : 'Need Expert Workshop Installation in Dubai?'}
          </h3>
          <p className="text-sm text-gray-300 max-w-2xl">
            {dict.products.directOrderMsg}
          </p>
        </div>

        <a
          href="https://wa.me/971565694440?text=Hello%20SpeederSpider!%20I%20am%20looking%20for%20automotive%20products%20and%20installation%20in%20Dubai."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all shrink-0 hover:scale-105"
        >
          <WhatsAppIcon className="w-4 h-4 fill-current" />
          <span>{isRtl ? 'تحدث مع الفنيين مباشرة' : 'Speak with Technicians'}</span>
        </a>
      </div>

      {/* Detail Modal Dialog */}
      {activeModalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveModalProduct(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-brand-deepNavy border border-brand-steelBlue/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalProduct(null)}
              className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} p-2 rounded-xl bg-brand-navy/80 border border-brand-steelBlue/50 text-gray-300 hover:text-white hover:border-brand-cyan transition-all`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Product Large Image */}
              <div className="relative aspect-video w-full rounded-2xl bg-brand-navy border border-brand-steelBlue/40 overflow-hidden flex items-center justify-center p-6">
                <Image
                  src={activeModalProduct.image_url}
                  alt={isRtl ? activeModalProduct.name_ar : activeModalProduct.name_en}
                  width={600}
                  height={400}
                  className="w-full h-full object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
                  unoptimized
                />
                <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} px-3 py-1 rounded-full bg-brand-deepNavy/90 border border-brand-cyan/50 text-xs font-mono font-bold text-brand-cyan`}>
                  {isRtl ? activeModalProduct.brand_ar : activeModalProduct.brand_en}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white font-display">
                  {isRtl ? activeModalProduct.name_ar : activeModalProduct.name_en}
                </h3>
                <p className="text-sm font-mono text-gray-400">
                  {isRtl ? activeModalProduct.name_en : activeModalProduct.name_ar}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-brand-navy border border-brand-steelBlue/40 text-xs font-mono text-gray-300">
                    {dict.products.brandLabel}: <strong className="text-white">{isRtl ? activeModalProduct.brand_ar : activeModalProduct.brand_en}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-brand-cyan/15 border border-brand-cyan/40 text-xs font-mono text-brand-cyan">
                    {dict.products.priceLabel}: <strong>{isRtl ? activeModalProduct.price_ar : activeModalProduct.price_en}</strong>
                  </span>
                  {activeModalProduct.category && (
                    <span className="px-2.5 py-1 rounded-md bg-brand-navy border border-brand-steelBlue/40 text-xs font-mono text-gray-300">
                      {activeModalProduct.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2 pt-2 border-t border-brand-steelBlue/30">
                <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-400">
                  {dict.products.viewDetails}
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {isRtl ? activeModalProduct.description_ar : activeModalProduct.description_en}
                </p>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-navy/60 border border-brand-steelBlue/30 text-xs text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isRtl ? 'ضمان الجودة والتوافق مع المركبة' : 'Vehicle Compatibility Guaranteed'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-navy/60 border border-brand-steelBlue/30 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
                  <span>{isRtl ? 'تركيب فوري داخل ورشة القوز' : 'Al Quoz Atelier Quick Installation'}</span>
                </div>
              </div>

              {/* WhatsApp Enquiry Button inside modal */}
              <div className="pt-4 border-t border-brand-steelBlue/40 flex flex-col sm:flex-row gap-3">
                <a
                  href={getWhatsAppUrl(activeModalProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:scale-[1.02]"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current" />
                  <span>{dict.products.enquireWhatsApp}</span>
                </a>
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="py-3.5 px-6 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-gray-300 hover:text-white hover:border-brand-cyan text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {dict.common.back}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
