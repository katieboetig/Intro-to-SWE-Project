export default function RecipeCard({ recipe, onOpen }) {
  return (
    <button
      className="recipe-card"
      onClick={() => onOpen(recipe.id)}
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        textAlign: 'left',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 12,
        background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
      }}
    >
      <img
        src={recipe.image}
        alt={recipe.title}
        width="96"
        height="96"
        style={{ borderRadius: 8, objectFit: 'cover' }}
        loading="lazy"
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{recipe.title}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          {recipe.readyInMinutes ? `${recipe.readyInMinutes} min • ` : ''}
          {recipe.servings ? `${recipe.servings} servings` : ''}
        </div>
      </div>
    </button>
  );
}
