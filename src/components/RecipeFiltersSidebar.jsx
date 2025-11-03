import { useState, useEffect } from "react";

// Option lists (trim as you like)
const DIETS = ["vegetarian","vegan","pescetarian","ketogenic","gluten free","paleo","primal","whole30"];
const CUISINES = ["African","American","British","Cajun","Caribbean","Chinese","Eastern European","European","French","German","Greek","Indian","Irish","Italian","Japanese","Jewish","Korean","Latin American","Mediterranean","Mexican","Middle Eastern","Nordic","Southern","Spanish","Thai","Vietnamese"];
const INTOLERANCES = ["Dairy","Egg","Gluten","Grain","Peanut","Seafood","Sesame","Shellfish","Soy","Sulfite","Tree Nut","Wheat"];

// UI price “buckets” in USD per serving; client-side using pricePerServing
const PRICE_BUCKETS = [
  { label: "$0 – $2", min: 0, max: 2 },
  { label: "$2 – $5", min: 2, max: 5 },
  { label: "$5 – $10", min: 5, max: 10 },
  { label: "Over $10", min: 10, max: Infinity },
];

export default function RecipeFiltersSidebar({ value, onChange }) {
  // local draft (so you can change without firing a fetch every click)
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const toggle = (k, item) => {
    const set = new Set(draft[k]);
    set.has(item) ? set.delete(item) : set.add(item);
    setDraft({ ...draft, [k]: Array.from(set) });
  };

  const toggleBucket = (idx) => {
    const next = new Set(draft.priceBuckets);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setDraft({ ...draft, priceBuckets: Array.from(next) });
  };

  const setRange = (k, which, v) => {
    const n = v === "" ? "" : Number(v);
    setDraft({ ...draft, [k]: { ...draft[k], [which]: isNaN(n) ? "" : n } });
  };

  return (
    <aside
      className="
        w-full md:w-72 shrink-0 border border-gray-200 rounded-xl bg-white
        md:sticky md:top-20
        md:max-h-[calc(100vh-6rem)]  md:overflow-y-auto
        p-4
      "
    >
      {/* Search text */}
      <div className="mb-4">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Search recipes…"
          value={draft.query}
          onChange={(e) => setDraft({ ...draft, query: e.target.value })}
        />
      </div>

      {/* Diet */}
      <Section title="Diet">
        {DIETS.map(d => (
          <Checkbox key={d} label={d} checked={draft.diets.includes(d)} onChange={() => toggle("diets", d)} />
        ))}
      </Section>

      {/* Cuisine */}
      <Section title="Cuisine">
        <div className="grid grid-cols-2 gap-2">
          {CUISINES.map(c => (
            <Checkbox key={c} label={c} checked={draft.cuisines.includes(c)} onChange={() => toggle("cuisines", c)} />
          ))}
        </div>
      </Section>

      {/* Intolerances */}
      <Section title="Intolerances">
        <div className="grid grid-cols-2 gap-2">
          {INTOLERANCES.map(i => (
            <Checkbox key={i} label={i} checked={draft.intolerances.includes(i)} onChange={() => toggle("intolerances", i)} />
          ))}
        </div>
      </Section>

      {/* Price (client-side using pricePerServing) */}
      <Section title="Price per Serving (USD)">
        {PRICE_BUCKETS.map((b, idx) => (
          <Checkbox key={b.label} label={b.label} checked={draft.priceBuckets.includes(idx)} onChange={() => toggleBucket(idx)} />
        ))}
        <div className="flex items-center gap-2 mt-2">
          <input className="w-20 border rounded px-2 py-1" inputMode="decimal" placeholder="Min"
                 value={draft.price.min ?? ""} onChange={(e)=>setRange("price","min",e.target.value)} />
          <span>—</span>
          <input className="w-20 border rounded px-2 py-1" inputMode="decimal" placeholder="Max"
                 value={draft.price.max ?? ""} onChange={(e)=>setRange("price","max",e.target.value)} />
        </div>
      </Section>

      {/* Nutrition ranges */}
      <MacroRange title="Calories"  value={draft.calories}  onChange={(min,max)=>setDraft({...draft, calories:{min,max}})} />
      <MacroRange title="Protein (g)" value={draft.protein} onChange={(min,max)=>setDraft({...draft, protein:{min,max}})} />
      <MacroRange title="Carbs (g)"   value={draft.carbs}   onChange={(min,max)=>setDraft({...draft, carbs:{min,max}})} />
      <MacroRange title="Fat (g)"     value={draft.fat}     onChange={(min,max)=>setDraft({...draft, fat:{min,max}})} />

      <div className="flex gap-2 mt-4">
        <button className="px-3 py-2 rounded bg-gray-100" onClick={() => setDraft(value)}>Reset</button>
        <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={() => onChange(draft)}>Apply Filters</button>
      </div>
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <div className="font-medium mb-2">{title}</div>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function MacroRange({ title, value, onChange }) {
  return (
    <Section title={title}>
      <div className="flex items-center gap-2">
        <input className="w-20 border rounded px-2 py-1" inputMode="numeric" placeholder="Min"
               value={value.min ?? ""} onChange={(e)=>onChange(e.target.value===""?"":Number(e.target.value), value.max)} />
        <span>—</span>
        <input className="w-20 border rounded px-2 py-1" inputMode="numeric" placeholder="Max"
               value={value.max ?? ""} onChange={(e)=>onChange(value.min, e.target.value===""?"":Number(e.target.value))} />
      </div>
    </Section>
  );
}
