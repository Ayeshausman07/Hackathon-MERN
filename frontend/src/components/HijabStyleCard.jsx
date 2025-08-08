import Rating from './Rating';

export default function HijabStyleCard({ style }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="h-48 overflow-hidden">
        <img
          src={style.image.url}
          alt={style.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{style.name}</h3>
        <p className="text-gray-600 mb-3 line-clamp-2">{style.description}</p>
        <div className="flex items-center">
          <Rating value={style.averageRating || 0} />
          <span className="ml-2 text-gray-600">
            {style.reviews?.length || 0} reviews
          </span>
        </div>
      </div>
    </div>
  );
}