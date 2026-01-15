import React from 'react';
import { useStore } from '../services/store';
import { MerchItem, Drag } from '../types';

interface MerchPageProps {
    onSelectMerch: (item: MerchItem, drag: Drag | null) => void;
}

export const MerchPage: React.FC<MerchPageProps> = ({ onSelectMerch }) => {
    const { state } = useStore();

    return (
        <button
            onClick={() => onSelectMerch(item, drag)}
            className="bg-white text-black font-pixel px-4 py-1 hover:bg-gray-200 uppercase text-sm"
        >
            Comprar
        </button>
                                    </div >
                                </div >
                            ))}
                        </div >
                    </div >
                ))}
            </section >
        </div >
    );
};
