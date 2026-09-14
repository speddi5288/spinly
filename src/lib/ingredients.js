// Nutrition per 100 g comes from USDA FoodData Central, SR Legacy release
// (https://fdc.nal.usda.gov). Gram weights per unit are kitchen measures,
// mostly taken from the portion data on the same USDA rows.

const LIST = [
  // Fridge
  { id: 'greek-yogurt-nonfat', name: 'nonfat plain Greek yogurt', aliases: ['greek yogurt', 'nonfat greek yogurt'], aisle: 'fridge', usda: { fdcId: 170894, description: 'Yogurt, Greek, plain, nonfat' }, per100g: { kcal: 59, protein: 10.2, fat: 0.39, carbs: 3.6, fiber: 0, sugars: 3.24 }, grams: { cup: 227, tbsp: 14 }, dairy: true },
  { id: 'greek-yogurt-whole', name: 'whole-milk plain Greek yogurt', aliases: ['whole milk greek yogurt'], aisle: 'fridge', usda: { fdcId: 171304, description: 'Yogurt, Greek, plain, whole milk' }, per100g: { kcal: 97, protein: 9, fat: 5, carbs: 3.98, fiber: 0, sugars: 4 }, grams: { cup: 227, tbsp: 14 }, dairy: true },
  { id: 'milk-2', name: '2% milk', aliases: ['milk', 'reduced fat milk'], aisle: 'fridge', usda: { fdcId: 171267, description: 'Milk, reduced fat, fluid, 2% milkfat, with added vitamin A and vitamin D' }, per100g: { kcal: 50, protein: 3.3, fat: 1.98, carbs: 4.8, fiber: 0, sugars: 5.06 }, grams: { cup: 244, tbsp: 15 }, liquid: true, dairy: true },
  { id: 'milk-whole', name: 'whole milk', aliases: [], aisle: 'fridge', usda: { fdcId: 171265, description: 'Milk, whole, 3.25% milkfat, with added vitamin D' }, per100g: { kcal: 61, protein: 3.15, fat: 3.25, carbs: 4.8, fiber: 0, sugars: 5.05 }, grams: { cup: 244, tbsp: 15 }, liquid: true, dairy: true },
  { id: 'heavy-cream', name: 'heavy cream', aliases: ['heavy whipping cream', 'cream'], aisle: 'fridge', usda: { fdcId: 170859, description: 'Cream, fluid, heavy whipping' }, per100g: { kcal: 340, protein: 2.84, fat: 36.1, carbs: 2.84, fiber: 0, sugars: 2.92 }, grams: { cup: 238, tbsp: 15 }, liquid: true, dairy: true },
  { id: 'cream-cheese', name: 'cream cheese', aliases: [], aisle: 'fridge', usda: { fdcId: 173418, description: 'Cheese, cream' }, per100g: { kcal: 350, protein: 6.15, fat: 34.4, carbs: 5.52, fiber: 0, sugars: 3.76 }, grams: { tbsp: 14.5 }, dairy: true },
  { id: 'egg-yolk', name: 'egg yolks', aliases: ['egg yolk', 'yolks'], whole: { singular: 'large egg yolk', plural: 'large egg yolks' }, aisle: 'fridge', usda: { fdcId: 172184, description: 'Egg, yolk, raw, fresh' }, per100g: { kcal: 322, protein: 15.9, fat: 26.5, carbs: 3.59, fiber: 0, sugars: 0.56 }, grams: { whole: 17 } },
  { id: 'coffee', name: 'cold brew or strong coffee', aliases: ['coffee', 'cold brew', 'espresso'], aisle: 'fridge', usda: { fdcId: 171890, description: 'Beverages, coffee, brewed, prepared with tap water' }, per100g: { kcal: 1, protein: 0.12, fat: 0.02, carbs: 0, fiber: 0, sugars: 0 }, grams: { cup: 237, tbsp: 15 }, liquid: true },

  // Freezer
  { id: 'strawberries-frozen', name: 'frozen strawberries', aliases: ['strawberries', 'strawberry'], aisle: 'freezer', usda: { fdcId: 168173, description: 'Strawberries, frozen, unsweetened' }, per100g: { kcal: 35, protein: 0.43, fat: 0.11, carbs: 9.13, fiber: 2.1, sugars: 4.56 }, grams: { cup: 149 } },
  { id: 'blueberries-frozen', name: 'frozen blueberries', aliases: ['blueberries', 'blueberry'], aisle: 'freezer', usda: { fdcId: 173950, description: 'Blueberries, frozen, unsweetened' }, per100g: { kcal: 51, protein: 0.42, fat: 0.64, carbs: 12.2, fiber: 2.7, sugars: 8.45 }, grams: { cup: 155 } },
  { id: 'raspberries-frozen', name: 'frozen raspberries', aliases: ['raspberries', 'raspberry'], aisle: 'freezer', usda: { fdcId: 168209, description: 'Raspberries, frozen, red, unsweetened' }, per100g: { kcal: 56, protein: 1.15, fat: 0.81, carbs: 12.6, fiber: 4.3, sugars: 6.54 }, grams: { cup: 140 } },
  { id: 'mango', name: 'frozen mango chunks', aliases: ['mango'], aisle: 'freezer', usda: { fdcId: 169910, description: 'Mangos, raw' }, per100g: { kcal: 60, protein: 0.82, fat: 0.38, carbs: 15, fiber: 1.6, sugars: 13.7 }, grams: { cup: 165 } },

  // Produce
  { id: 'banana', name: 'bananas', aliases: ['banana'], whole: { singular: 'medium banana', plural: 'medium bananas' }, aisle: 'produce', usda: { fdcId: 173944, description: 'Bananas, raw' }, per100g: { kcal: 89, protein: 1.09, fat: 0.33, carbs: 22.8, fiber: 2.6, sugars: 12.2 }, grams: { whole: 118, cup: 150 } },
  { id: 'mint', name: 'fresh mint leaves', aliases: ['mint', 'peppermint'], aisle: 'produce', usda: { fdcId: 173474, description: 'Peppermint, fresh' }, per100g: { kcal: 70, protein: 3.75, fat: 0.94, carbs: 14.9, fiber: 8, sugars: 0 }, unreported: ['sugars'], grams: { cup: 25.6, tbsp: 1.6 } },
  { id: 'lime-juice', name: 'lime juice', aliases: ['lime'], aisle: 'produce', usda: { fdcId: 168156, description: 'Lime juice, raw' }, per100g: { kcal: 25, protein: 0.42, fat: 0.07, carbs: 8.42, fiber: 0.4, sugars: 1.69 }, grams: { tbsp: 15.4, tsp: 5.1 }, liquid: true },
  { id: 'lemon-juice', name: 'lemon juice', aliases: ['lemon'], aisle: 'produce', usda: { fdcId: 167747, description: 'Lemon juice, raw' }, per100g: { kcal: 22, protein: 0.35, fat: 0.24, carbs: 6.9, fiber: 0.3, sugars: 2.52 }, grams: { tbsp: 15.2, tsp: 5.1 }, liquid: true },

  // Pantry
  { id: 'whey', name: 'whey protein powder', aliases: ['protein powder', 'whey', 'protein'], aisle: 'pantry', usda: { fdcId: 173180, description: 'Beverages, Protein powder whey based' }, per100g: { kcal: 352, protein: 78.1, fat: 1.56, carbs: 6.25, fiber: 3.1, sugars: 0 }, grams: { scoop: 32, tbsp: 10 }, dairy: true },
  { id: 'sugar', name: 'granulated sugar', aliases: ['sugar'], aisle: 'pantry', usda: { fdcId: 169655, description: 'Sugars, granulated' }, per100g: { kcal: 387, protein: 0, fat: 0, carbs: 100, fiber: 0, sugars: 99.8 }, grams: { cup: 200, tbsp: 12.5, tsp: 4.2 }, addedSugar: true },
  { id: 'maple-syrup', name: 'maple syrup', aliases: ['maple'], aisle: 'pantry', usda: { fdcId: 169661, description: 'Syrups, maple' }, per100g: { kcal: 260, protein: 0.04, fat: 0.06, carbs: 67, fiber: 0, sugars: 60.5 }, grams: { cup: 315, tbsp: 20, tsp: 6.7 }, liquid: true, addedSugar: true },
  { id: 'honey', name: 'honey', aliases: [], aisle: 'pantry', usda: { fdcId: 169640, description: 'Honey' }, per100g: { kcal: 304, protein: 0.3, fat: 0, carbs: 82.4, fiber: 0.2, sugars: 82.1 }, grams: { tbsp: 21, tsp: 7 }, addedSugar: true },
  { id: 'vanilla', name: 'vanilla extract', aliases: ['vanilla'], aisle: 'pantry', usda: { fdcId: 173471, description: 'Vanilla extract' }, per100g: { kcal: 288, protein: 0.06, fat: 0.06, carbs: 12.6, fiber: 0, sugars: 12.6 }, grams: { tsp: 4.2, tbsp: 13 }, liquid: true },
  { id: 'cocoa', name: 'unsweetened cocoa powder', aliases: ['cocoa', 'cocoa powder'], aisle: 'pantry', usda: { fdcId: 169593, description: 'Cocoa, dry powder, unsweetened' }, per100g: { kcal: 228, protein: 19.6, fat: 13.7, carbs: 57.9, fiber: 37, sugars: 1.75 }, grams: { cup: 86, tbsp: 5.4, tsp: 1.8 } },
  { id: 'dark-chocolate', name: 'dark chocolate', aliases: ['chocolate', 'chocolate chips', 'dark chocolate chips'], aisle: 'pantry', usda: { fdcId: 170273, description: 'Chocolate, dark, 70-85% cacao solids' }, per100g: { kcal: 598, protein: 7.79, fat: 42.6, carbs: 45.9, fiber: 10.9, sugars: 24 }, grams: { tbsp: 10 }, addedSugar: true },
  { id: 'cookies', name: 'chocolate sandwich cookies', aliases: ['oreos', 'oreo', 'cookies'], whole: { singular: 'chocolate sandwich cookie', plural: 'chocolate sandwich cookies' }, aisle: 'pantry', usda: { fdcId: 172718, description: 'Cookies, chocolate sandwich, with creme filling, regular' }, per100g: { kcal: 464, protein: 5.21, fat: 19.1, carbs: 71, fiber: 2.9, sugars: 40.7 }, grams: { whole: 12 }, addedSugar: true },
  { id: 'graham', name: 'graham crackers', aliases: ['graham cracker'], whole: { singular: 'graham cracker sheet', plural: 'graham cracker sheets' }, aisle: 'pantry', usda: { fdcId: 174957, description: 'Cookies, graham crackers, plain or honey (includes cinnamon)' }, per100g: { kcal: 430, protein: 6.69, fat: 10.6, carbs: 77.7, fiber: 3.4, sugars: 24.8 }, grams: { whole: 14 }, addedSugar: true },
  { id: 'granola', name: 'granola', aliases: [], aisle: 'pantry', usda: { fdcId: 171646, description: 'Cereals ready-to-eat, granola, homemade' }, per100g: { kcal: 489, protein: 13.7, fat: 24.3, carbs: 53.9, fiber: 8.9, sugars: 19.8 }, grams: { cup: 122, tbsp: 7.6 }, addedSugar: true },
  { id: 'peanut-butter', name: 'peanut butter', aliases: [], aisle: 'pantry', usda: { fdcId: 172470, description: 'Peanut butter, smooth style, without salt' }, per100g: { kcal: 598, protein: 22.2, fat: 51.4, carbs: 22.3, fiber: 5, sugars: 10.5 }, grams: { tbsp: 16 } },
  { id: 'pumpkin', name: 'canned pumpkin purée', aliases: ['pumpkin', 'pumpkin puree'], aisle: 'pantry', usda: { fdcId: 168450, description: 'Pumpkin, canned, without salt' }, per100g: { kcal: 34, protein: 1.1, fat: 0.28, carbs: 8.09, fiber: 2.9, sugars: 3.3 }, grams: { cup: 245 } },
  { id: 'cinnamon', name: 'ground cinnamon', aliases: ['cinnamon'], aisle: 'pantry', usda: { fdcId: 171320, description: 'Spices, cinnamon, ground' }, per100g: { kcal: 247, protein: 3.99, fat: 1.24, carbs: 80.6, fiber: 53.1, sugars: 2.17 }, grams: { tsp: 2.6, tbsp: 7.8 } },
  { id: 'guar-gum', name: 'guar gum', aliases: ['xanthan gum'], aisle: 'pantry', usda: { fdcId: 169045, description: 'Gums, seed gums (includes locust bean, guar)' }, per100g: { kcal: 332, protein: 4.6, fat: 0.5, carbs: 77.3, fiber: 77.3, sugars: 0 }, grams: { tsp: 2.8 } },
  { id: 'salt', name: 'salt', aliases: [], aisle: 'pantry', usda: { fdcId: 173468, description: 'Salt, table' }, per100g: { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugars: 0 }, grams: { pinch: 0.4, tsp: 6 }, staple: true },
  { id: 'water', name: 'water', aliases: [], aisle: 'pantry', usda: { fdcId: 173647, description: 'Beverages, water, tap, drinking' }, per100g: { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugars: 0 }, grams: { cup: 237, tbsp: 15 }, liquid: true, staple: true },

  // Mostly for bowls and smoothies
  { id: 'soy-yogurt', name: 'plain soy yogurt', aliases: ['soy yogurt'], aisle: 'fridge', usda: { fdcId: 175227, description: 'SILK Plain soy yogurt' }, per100g: { kcal: 66, protein: 2.64, fat: 1.76, carbs: 9.69, fiber: 0.4, sugars: 5.29 }, grams: { cup: 227 }, addedSugar: true },
  { id: 'almond-milk', name: 'unsweetened almond milk', aliases: ['almond milk'], aisle: 'fridge', usda: { fdcId: 174832, description: 'Beverages, almond milk, unsweetened, shelf stable' }, per100g: { kcal: 15, protein: 0.4, fat: 0.96, carbs: 1.31, fiber: 0.2, sugars: 0.81 }, grams: { cup: 240, tbsp: 15 }, liquid: true },
  { id: 'orange-juice', name: 'orange juice', aliases: ['oj'], aisle: 'fridge', usda: { fdcId: 169098, description: 'Orange juice, raw' }, per100g: { kcal: 45, protein: 0.7, fat: 0.2, carbs: 10.4, fiber: 0.2, sugars: 8.4 }, grams: { cup: 248 }, liquid: true },
  { id: 'cherries-frozen', name: 'frozen dark sweet cherries', aliases: ['cherries', 'cherry'], aisle: 'freezer', usda: { fdcId: 171719, description: 'Cherries, sweet, raw' }, per100g: { kcal: 63, protein: 1.06, fat: 0.2, carbs: 16, fiber: 2.1, sugars: 12.8 }, grams: { cup: 154 } },
  { id: 'pineapple', name: 'frozen pineapple chunks', aliases: ['pineapple'], aisle: 'freezer', usda: { fdcId: 169124, description: 'Pineapple, raw, all varieties' }, per100g: { kcal: 50, protein: 0.54, fat: 0.12, carbs: 13.1, fiber: 1.4, sugars: 9.85 }, grams: { cup: 165 } },
  { id: 'peaches', name: 'frozen peach slices', aliases: ['peach', 'peaches'], aisle: 'freezer', usda: { fdcId: 169928, description: 'Peaches, yellow, raw' }, per100g: { kcal: 39, protein: 0.91, fat: 0.25, carbs: 9.54, fiber: 1.5, sugars: 8.39 }, grams: { cup: 154 } },
  { id: 'strawberries', name: 'fresh strawberries', aliases: ['sliced strawberries'], aisle: 'produce', usda: { fdcId: 167762, description: 'Strawberries, raw' }, per100g: { kcal: 32, protein: 0.67, fat: 0.3, carbs: 7.68, fiber: 2, sugars: 4.89 }, grams: { cup: 166 } },
  { id: 'blueberries', name: 'fresh blueberries', aliases: [], aisle: 'produce', usda: { fdcId: 171711, description: 'Blueberries, raw' }, per100g: { kcal: 57, protein: 0.74, fat: 0.33, carbs: 14.5, fiber: 2.4, sugars: 9.96 }, grams: { cup: 148 } },
  { id: 'apple', name: 'apples', aliases: ['apple'], whole: { singular: 'medium apple', plural: 'medium apples' }, aisle: 'produce', usda: { fdcId: 171688, description: 'Apples, raw, with skin' }, per100g: { kcal: 52, protein: 0.26, fat: 0.17, carbs: 13.8, fiber: 2.4, sugars: 10.4 }, grams: { whole: 182, cup: 125 } },
  { id: 'lemon-zest', name: 'lemon zest', aliases: ['lemon peel'], aisle: 'produce', usda: { fdcId: 167749, description: 'Lemon peel, raw' }, per100g: { kcal: 47, protein: 1.5, fat: 0.3, carbs: 16, fiber: 10.6, sugars: 4.17 }, grams: { tsp: 2, tbsp: 6 } },
  { id: 'spinach', name: 'baby spinach', aliases: ['spinach'], aisle: 'produce', usda: { fdcId: 168462, description: 'Spinach, raw' }, per100g: { kcal: 23, protein: 2.86, fat: 0.39, carbs: 3.63, fiber: 2.2, sugars: 0.42 }, grams: { cup: 30 } },
  { id: 'cucumber', name: 'diced cucumber', aliases: ['cucumber'], aisle: 'produce', usda: { fdcId: 168409, description: 'Cucumber, with peel, raw' }, per100g: { kcal: 15, protein: 0.65, fat: 0.11, carbs: 3.63, fiber: 0.5, sugars: 1.67 }, grams: { cup: 133 } },
  { id: 'dill', name: 'fresh dill', aliases: ['dill'], aisle: 'produce', usda: { fdcId: 172233, description: 'Dill weed, fresh' }, per100g: { kcal: 43, protein: 3.46, fat: 1.12, carbs: 7.02, fiber: 2.1, sugars: 0 }, unreported: ['sugars'], grams: { tbsp: 1 } },
  { id: 'ginger', name: 'grated fresh ginger', aliases: ['ginger'], aisle: 'produce', usda: { fdcId: 169231, description: 'Ginger root, raw' }, per100g: { kcal: 80, protein: 1.82, fat: 0.75, carbs: 17.8, fiber: 2, sugars: 1.7 }, grams: { tsp: 2 } },
  { id: 'dates', name: 'Medjool dates', aliases: ['date', 'dates', 'medjool'], whole: { singular: 'Medjool date', plural: 'Medjool dates' }, aisle: 'produce', usda: { fdcId: 168191, description: 'Dates, medjool' }, per100g: { kcal: 277, protein: 1.81, fat: 0.15, carbs: 75, fiber: 6.7, sugars: 66.5 }, grams: { whole: 24 } },
  { id: 'jam', name: 'strawberry jam', aliases: ['jam', 'preserves'], aisle: 'pantry', usda: { fdcId: 169641, description: 'Jams and preserves' }, per100g: { kcal: 278, protein: 0.37, fat: 0.07, carbs: 68.9, fiber: 1.1, sugars: 48.5 }, grams: { tbsp: 20, tsp: 6.7 }, addedSugar: true },
  { id: 'oats', name: 'rolled oats', aliases: ['oats', 'oatmeal'], aisle: 'pantry', usda: { fdcId: 173904, description: 'Cereals, oats, regular and quick, not fortified, dry' }, per100g: { kcal: 379, protein: 13.2, fat: 6.52, carbs: 67.7, fiber: 10.1, sugars: 0.99 }, grams: { cup: 81, tbsp: 5 } },
  { id: 'almond-butter', name: 'almond butter', aliases: [], aisle: 'pantry', usda: { fdcId: 168588, description: 'Nuts, almond butter, plain, without salt added' }, per100g: { kcal: 614, protein: 21, fat: 55.5, carbs: 18.8, fiber: 10.3, sugars: 4.43 }, grams: { tbsp: 16 } },
  { id: 'walnuts', name: 'chopped walnuts', aliases: ['walnut', 'walnuts'], aisle: 'pantry', usda: { fdcId: 170187, description: 'Nuts, walnuts, english' }, per100g: { kcal: 654, protein: 15.2, fat: 65.2, carbs: 13.7, fiber: 6.7, sugars: 2.61 }, grams: { tbsp: 7.3, cup: 117 } },
  { id: 'pistachios', name: 'shelled pistachios', aliases: ['pistachio', 'pistachios'], aisle: 'pantry', usda: { fdcId: 170185, description: 'Nuts, pistachio nuts, dry roasted, without salt added' }, per100g: { kcal: 572, protein: 21, fat: 45.8, carbs: 28.3, fiber: 10.3, sugars: 7.74 }, grams: { tbsp: 7.7 } },
  { id: 'almonds', name: 'sliced almonds', aliases: ['almonds'], aisle: 'pantry', usda: { fdcId: 170567, description: 'Nuts, almonds' }, per100g: { kcal: 579, protein: 21.2, fat: 49.9, carbs: 21.6, fiber: 12.5, sugars: 4.35 }, grams: { tbsp: 6.75 } },
  { id: 'pumpkin-seeds', name: 'pepitas', aliases: ['pumpkin seeds'], aisle: 'pantry', usda: { fdcId: 170556, description: 'Seeds, pumpkin and squash seed kernels, dried' }, per100g: { kcal: 559, protein: 30.2, fat: 49, carbs: 10.7, fiber: 6, sugars: 1.4 }, grams: { tbsp: 8 } },
  { id: 'chia', name: 'chia seeds', aliases: ['chia'], aisle: 'pantry', usda: { fdcId: 170554, description: 'Seeds, chia seeds, dried' }, per100g: { kcal: 486, protein: 16.5, fat: 30.7, carbs: 42.1, fiber: 34.4, sugars: 0 }, unreported: ['sugars'], grams: { tbsp: 12, tsp: 4 } },
  { id: 'flax', name: 'ground flaxseed', aliases: ['flaxseed', 'flax'], aisle: 'pantry', usda: { fdcId: 169414, description: 'Seeds, flaxseed' }, per100g: { kcal: 534, protein: 18.3, fat: 42.2, carbs: 28.9, fiber: 27.3, sugars: 1.55 }, grams: { tbsp: 7 } },
  { id: 'coconut-flakes', name: 'unsweetened coconut flakes', aliases: ['coconut flakes', 'shredded coconut'], aisle: 'pantry', usda: { fdcId: 170170, description: 'Nuts, coconut meat, dried (desiccated), not sweetened' }, per100g: { kcal: 660, protein: 6.88, fat: 64.5, carbs: 23.6, fiber: 16.3, sugars: 7.35 }, grams: { tbsp: 5 } },
  { id: 'coconut-milk', name: 'canned coconut milk', aliases: ['coconut milk'], aisle: 'pantry', usda: { fdcId: 170173, description: 'Nuts, coconut milk, canned (liquid expressed from grated meat and water)' }, per100g: { kcal: 197, protein: 2.02, fat: 21.3, carbs: 2.81, fiber: 0, sugars: 0 }, unreported: ['fiber', 'sugars'], grams: { cup: 226, tbsp: 15 }, liquid: true },
  { id: 'coconut-water', name: 'coconut water', aliases: [], aisle: 'pantry', usda: { fdcId: 170174, description: 'Nuts, coconut water (liquid from coconuts)' }, per100g: { kcal: 19, protein: 0.72, fat: 0.2, carbs: 3.71, fiber: 1.1, sugars: 2.61 }, grams: { cup: 240 }, liquid: true },
  { id: 'chickpeas', name: 'canned chickpeas, rinsed', aliases: ['chickpeas', 'garbanzo beans'], aisle: 'pantry', usda: { fdcId: 173801, description: 'Chickpeas, mature seeds, canned, drained, rinsed in tap water' }, per100g: { kcal: 138, protein: 7.04, fat: 2.47, carbs: 22.9, fiber: 6.3, sugars: 4 }, grams: { cup: 152 } },
  { id: 'olive-oil', name: 'extra-virgin olive oil', aliases: ['olive oil'], aisle: 'pantry', usda: { fdcId: 171413, description: 'Oil, olive, salad or cooking' }, per100g: { kcal: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sugars: 0 }, grams: { tbsp: 13.5, tsp: 4.5 }, liquid: true },
  { id: 'turmeric', name: 'ground turmeric', aliases: ['turmeric'], aisle: 'pantry', usda: { fdcId: 172231, description: 'Spices, turmeric, ground' }, per100g: { kcal: 312, protein: 9.68, fat: 3.25, carbs: 67.1, fiber: 22.7, sugars: 3.21 }, grams: { tsp: 3 } },
]

export const INGREDIENT_LIST = LIST
export const INGREDIENTS = Object.fromEntries(LIST.map((ingredient) => [ingredient.id, ingredient]))

export const AISLE_LABELS = { freezer: 'Freezer', fridge: 'Fridge', produce: 'Produce', pantry: 'Pantry' }
export const AISLE_ORDER = ['freezer', 'fridge', 'produce', 'pantry']

export function getIngredient(id) {
  const ingredient = INGREDIENTS[id]
  if (!ingredient) throw new Error(`Unknown ingredient "${id}"`)
  return ingredient
}

const normalize = (text) => String(text ?? '').toLowerCase().replace(/[^a-z0-9% ]+/g, ' ').replace(/\s+/g, ' ').trim()

// "oat milk" or "coconut yogurt" must not match a dairy ingredient.
const PLANT_BASED = /\b(oat|almond|soy|coconut|cashew|rice|pea|hemp|plant|vegan|dairy free|non dairy)\b/

/** Best catalog match for a free-text ingredient name, or null. Used for community recipes. */
export function findIngredientByName(name) {
  const text = normalize(name)
  if (!text) return null
  const plantBased = PLANT_BASED.test(text)
  let best = null
  let bestLength = 0
  for (const ingredient of LIST) {
    if (plantBased && ingredient.dairy) continue
    for (const candidate of [ingredient.name, ...ingredient.aliases]) {
      const c = normalize(candidate)
      if (c && (text === c || ` ${text} `.includes(` ${c} `)) && c.length > bestLength) {
        best = ingredient
        bestLength = c.length
      }
    }
  }
  return best
}
