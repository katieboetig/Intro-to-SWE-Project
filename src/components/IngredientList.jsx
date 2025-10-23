import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";

export default function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Query ingredients for the current user, ordered by creation date
    const q = query(
      collection(db, "ingredients"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ingredientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIngredients(ingredientsData);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (ingredientId) => {
    if (window.confirm("Are you sure you want to delete this ingredient?")) {
      try {
        await deleteDoc(doc(db, "ingredients", ingredientId));
      } catch (error) {
        console.error("Error deleting ingredient:", error);
        alert("Error deleting ingredient: " + error.message);
      }
    }
  };

  if (loading) {
    return <div>Loading ingredients...</div>;
  }

  if (ingredients.length === 0) {
    return (
      <div style={{ 
        padding: "2rem", 
        textAlign: "center", 
        color: "#666",
        border: "1px solid #ddd",
        borderRadius: "8px"
      }}>
        <h3>No ingredients yet</h3>
        <p>Add your first ingredient using the form above!</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Your Ingredients ({ingredients.length})</h3>
      <div style={{ display: "grid", gap: "8px" }}>
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              backgroundColor: "#f9f9f9"
            }}
          >
            <div>
              <strong>{ingredient.name}</strong>
              <span style={{ marginLeft: "8px", color: "#666" }}>
                {ingredient.quantity} {ingredient.unit}
              </span>
            </div>
            <button
              onClick={() => handleDelete(ingredient.id)}
              style={{
                padding: "4px 8px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
