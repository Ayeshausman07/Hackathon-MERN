import { useState } from 'react';

export default function Rating({ value = 0, editable = false, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (newValue) => {
    if (editable && onChange) {
      onChange(newValue);
    }
  };

  const stars = [1, 2, 3, 4, 5].map((star) => {
    const filled = star <= (hoverValue || value);
    return (
      <span
        key={star}
        className={`text-2xl ${filled ? 'text-yellow-400' : 'text-gray-300'} ${
          editable ? 'cursor-pointer' : ''
        }`}
        onClick={() => handleClick(star)}
        onMouseEnter={() => editable && setHoverValue(star)}
        onMouseLeave={() => editable && setHoverValue(0)}
      >
        ★
      </span>
    );
  });

  return <div className="flex">{stars}</div>;
}