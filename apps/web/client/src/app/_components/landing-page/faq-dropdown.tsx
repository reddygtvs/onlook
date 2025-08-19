import { Icons } from '@onlook/ui/icons';
import { useState, useRef, useEffect } from 'react';

interface FAQ {
    question: string;
    answer: string;
}

interface FAQDropdownProps {
    faqs: FAQ[];
}

export function FAQDropdown({ faqs }: FAQDropdownProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        contentRefs.current = contentRefs.current.slice(0, faqs.length);
    }, [faqs.length]);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                const contentHeight = isOpen && contentRefs.current[idx]
                    ? contentRefs.current[idx]?.scrollHeight
                    : 0;

                return (
                    <div
                        key={faq.question}
                        className="py-1"
                    >
                        <button
                            className="flex items-center justify-between w-full text-left text-foreground-primary text-lg focus:outline-none cursor-pointer py-6 group hover:bg-background/30 transition-all duration-300 rounded-lg px-4"
                            onClick={() => toggleFAQ(idx)}
                            aria-expanded={isOpen}
                        >
                            <span className="font-medium pr-4 group-hover:text-foreground-primary transition-colors duration-200">
                                {faq.question}
                            </span>
                            <div 
                                className={`flex items-center justify-center w-8 h-8 shrink-0 transition-transform duration-300 ease-out ${
                                    isOpen ? 'rotate-45' : 'rotate-0'
                                }`}
                            >
                                <Icons.Plus className="w-6 h-6 text-foreground-primary/70" />
                            </div>
                        </button>
                        <div
                            className="overflow-hidden transition-all duration-300 ease-out"
                            style={{ 
                                height: contentHeight ? `${contentHeight}px` : '0px',
                                opacity: isOpen ? 1 : 0
                            }}
                        >
                            <div
                                ref={el => contentRefs.current[idx] = el}
                                className="px-6 pb-6"
                            >
                                <div className="pt-2 border-t border-border/10">
                                    <p className="text-foreground-secondary text-base leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
} 