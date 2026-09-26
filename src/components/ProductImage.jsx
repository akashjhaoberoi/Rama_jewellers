import React, { useState } from 'react';
import { IoDiamondOutline } from 'react-icons/io5';

export default function ProductImage({ product, className = '', ...props }) {
    const [failed, setFailed] = useState(false);
    const imageUrl = product?.imageURL || product?.imageUrl || product?.image || '';

    if (!imageUrl || failed) {
        return (
            <div className={`no-image-placeholder ${className}`.trim()} role="img" aria-label={`${product?.name || 'Product'} image unavailable`}>
                <IoDiamondOutline />
            </div>
        );
    }

    return (
        <img
            {...props}
            className={className}
            src={imageUrl}
            alt={props.alt || product?.name || 'Jewelry product'}
            onError={() => setFailed(true)}
        />
    );
}
