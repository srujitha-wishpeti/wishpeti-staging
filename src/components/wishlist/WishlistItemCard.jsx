import { ShoppingBag, Trash2, Plus } from 'lucide-react';

export default function WishlistItemCard({
  item,
  onDelete,
  onAddToCart
}) {
  return (
    <div className="wishlist-item-card">
      <div className="wishlist-item-image">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} loading="lazy" />
        ) : (
          <span>🎁</span>
        )}
      </div>

      <div className="wishlist-item-content">
        <h3>{item.title}</h3>

        <div className="wishlist-item-price">
          {item.price || 'Price N/A'}
        </div>

        <div className="wishlist-item-actions">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <ShoppingBag size={14} /> Buy
          </a>

          <button
            className="btn-primary"
            onClick={() => onAddToCart(item)}
          >
            <Plus size={14} /> Add to Cart
          </button>

          <button
            className="btn-icon"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
