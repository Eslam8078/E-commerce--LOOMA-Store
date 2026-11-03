require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./models/user.model");
const Category = require("./models/category.model");
const SubCategory = require("./models/subCategory.model");
const Product = require("./models/product.model");
const FAQ = require("./models/faq.model");
const Testimonial = require("./models/testimonial.model");

const shouldReset = process.argv.includes("--reset");

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function seed() {
  const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
  await mongoose.connect(process.env.DB_URI, options);
  console.log(`Connected to MongoDB (${mongoose.connection.name})`);

  if (shouldReset) {
    console.log("Resetting collections...");
    await Promise.all([
      User.deleteMany({ role: "customer" }),
      User.deleteMany({ email: { $in: ["eslam@gmail.com", "admin@ezstore.com"] } }),
      Category.deleteMany({}),
      SubCategory.deleteMany({}),
      Product.deleteMany({}),
      FAQ.deleteMany({}),
      Testimonial.deleteMany({}),
    ]);
  }

  let admin = await User.findOne({ email: "eslam@gmail.com" });
  if (!admin) {
    admin = await User.create({
      name: "Store Admin",
      email: "eslam@gmail.com",
      password: "eslam@123",
      role: "admin",
      gender: "male",
      DOB: new Date("1990-01-01"),
      mobilePhone: "01000000000",
    });
    console.log("Created admin user -> eslam@gmail.com / Admin@123");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const customerSeeds = [
    {
      name: "Ahmed Hassan",
      email: "ahmed@gmail.com",
      gender: "male",
      DOB: new Date("1996-05-12"),
      mobilePhone: "01111111111",
      addresses: [
        {
          label: "Home",
          governorate: "Cairo",
          city: "Nasr City",
          street: "12 Makram Ebeid St.",
          isDefault: true,
        },
      ],
    },
    {
      name: "Mona Ali",
      email: "mona@example.com",
      gender: "female",
      DOB: new Date("1998-09-23"),
      mobilePhone: "01222222222",
      addresses: [
        {
          label: "Home",
          governorate: "Giza",
          city: "6th of October",
          street: "5 Hosary St.",
          isDefault: true,
        },
      ],
    },
    {
      name: "Youssef Ibrahim",
      email: "youssef@example.com",
      gender: "male",
      DOB: new Date("1993-02-17"),
      mobilePhone: "01533333333",
      addresses: [
        {
          label: "Work",
          governorate: "Alexandria",
          city: "Smouha",
          street: "20 Fouad St.",
          isDefault: true,
        },
      ],
    },
  ];

  const customers = [];
  for (const seedUser of customerSeeds) {
    let user = await User.findOne({ email: seedUser.email });
    if (!user) {
      user = await User.create({ ...seedUser, password: "Customer@123", role: "customer" });
      console.log(`Created customer -> ${seedUser.email} / Customer@123`);
    }
    customers.push(user);
  }

  const categoryDefs = [
    {
      name: "Men",
      subcategories: ["T-Shirts", "Jackets", "Jeans", "Shirts"],
    },
    {
      name: "Women",
      subcategories: ["Dresses", "Blouses", "Jeans", "Abayas"],
    },
    {
      name: "Kids",
      subcategories: ["T-Shirts", "Dresses", "Pajamas", "Jackets"],
    },
    {
      name: "Accessories",
      subcategories: ["Bags", "Belts", "Scarves", "Sunglasses"],
    },
  ];

  const categoriesByName = {};
  const subcategoriesByKey = {};

  for (const def of categoryDefs) {
    const slug = slugify(def.name);
    let category = await Category.findOne({ slug });
    if (!category) {
      category = await Category.create({ name: def.name, slug, isActive: true });
      console.log(`Created category -> ${def.name}`);
    }
    categoriesByName[def.name] = category;

    for (const subName of def.subcategories) {
      const subSlug = slugify(`${def.name}-${subName}`);
      let subCategory = await SubCategory.findOne({ slug: subSlug });
      if (!subCategory) {
        subCategory = await SubCategory.create({
          name: subName,
          slug: subSlug,
          categoryId: category._id,
          isActive: true,
        });
        console.log(`  Created subcategory -> ${def.name} / ${subName}`);
      }
      subcategoriesByKey[`${def.name}:${subName}`] = subCategory;
    }
  }

  // Demo catalogue images are served directly from the Unsplash CDN. Replace these
  // URLs with your own licensed product photography before a commercial launch.
  const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=88`;
  const productDefs = [
    { name: "Classic Cotton T-Shirt", cat: "Men", sub: "T-Shirts", price: 350, stock: 60, season: "all", images: [photo("photo-1620799139834-6b8f844fbe61")], description: "A breathable everyday essential cut from soft, premium-feel cotton.", isNewArrival: true },
    { name: "Slim Fit Denim Jacket", cat: "Men", sub: "Jackets", price: 950, stock: 25, season: "winter", images: [photo("photo-1551028719-00167b16eac5")], description: "A timeless denim layer with considered seams and an easy modern fit.", isBestSeller: true },
    { name: "Slim Fit Jeans", cat: "Men", sub: "Jeans", price: 720, stock: 40, season: "all", images: [photo("photo-1542272604-787c3835535d")], description: "Everyday denim with a clean silhouette and comfortable stretch.", isBestSeller: true },
    { name: "Formal Business Shirt", cat: "Men", sub: "Shirts", price: 550, stock: 35, season: "all", images: [photo("photo-1603252109303-2751441dd157")], description: "An understated shirt that takes you from workdays to evenings.", isNewArrival: true },
    { name: "Pullover Hoodie", cat: "Men", sub: "Jackets", price: 680, stock: 30, season: "winter", images: [photo("photo-1556821840-3a63f95609a7")], description: "A relaxed fleece layer made for slower mornings and cool nights.", isBestSeller: true },
    { name: "Casual Chino Shorts", cat: "Men", sub: "Jeans", price: 420, stock: 45, season: "summer", images: [photo("photo-1591195853828-11db59a44f6b")], description: "Lightweight shorts with a neat finish and all-day comfort.", isNewArrival: true },

    { name: "Floral Summer Dress", cat: "Women", sub: "Dresses", price: 850, stock: 20, season: "summer", images: [photo("photo-1496747611176-843222e1e57c")], description: "A fluid, easy dress with a delicate print for brighter days.", isBestSeller: true },
    { name: "Chiffon Blouse", cat: "Women", sub: "Blouses", price: 480, stock: 30, season: "all", images: [photo("photo-1566206091558-7f218b696731")], description: "A softly draped blouse that brings effortless polish to any look.", isNewArrival: true },
    { name: "High-Waist Straight Jeans", cat: "Women", sub: "Jeans", price: 690, stock: 35, season: "all", images: [photo("photo-1541099649105-f69ad21f3246")], description: "A flattering high-rise shape designed for repeat wear.", isBestSeller: true },
    { name: "Knit Cardigan", cat: "Women", sub: "Blouses", price: 590, stock: 28, season: "winter", images: [photo("photo-1434389677669-e08b4cac3105")], description: "A soft knit layer with a relaxed feel and timeless texture.", isNewArrival: true },
    { name: "Elegant Embroidered Abaya", cat: "Women", sub: "Abayas", price: 1200, stock: 18, season: "all", images: [photo("photo-1590736969955-71cc94901144")], description: "A graceful modest layer finished with subtle embroidered detail.", isBestSeller: true },
    { name: "Pleated Midi Skirt", cat: "Women", sub: "Dresses", price: 520, stock: 24, season: "spring", images: [photo("photo-1583496661160-fb5886a0aaaa")], description: "A versatile pleated skirt with movement and an elegant drape.", isNewArrival: true },

    { name: "Kids Graphic T-Shirt Set", cat: "Kids", sub: "T-Shirts", price: 280, stock: 50, season: "all", images: [photo("photo-1519238263530-99bdd11df2ea")], description: "Soft, playful cotton essentials made for little adventures.", isBestSeller: true },
    { name: "Kids Party Dress", cat: "Kids", sub: "Dresses", price: 460, stock: 22, season: "all", images: [photo("photo-1518834107812-67b0b7c58434")], description: "A sweet occasion-ready dress with room to move and play.", isNewArrival: true },
    { name: "Kids Cotton Pajamas", cat: "Kids", sub: "Pajamas", price: 320, stock: 40, season: "all", images: [photo("photo-1514090458221-65bb69cf63e6")], description: "A breathable cotton sleep set for softer, comfier nights.", isBestSeller: true },
    { name: "Kids Winter Jacket", cat: "Kids", sub: "Jackets", price: 580, stock: 26, season: "winter", images: [photo("photo-1519689680058-324335c77eba")], description: "A warm, lightweight outer layer for chilly-day exploring.", isNewArrival: true },

    { name: "Leather Handbag", cat: "Accessories", sub: "Bags", price: 890, stock: 15, season: "all", images: [photo("photo-1584917865442-de89df76afd3")], description: "A structured everyday bag with a clean shape and thoughtful space.", isBestSeller: true },
    { name: "Classic Leather Belt", cat: "Accessories", sub: "Belts", price: 260, stock: 45, season: "all", images: [photo("photo-1624222247344-550fb8d03b78")], description: "A simple leather belt that brings the whole look together.", isNewArrival: true },
    { name: "Wool Winter Scarf", cat: "Accessories", sub: "Scarves", price: 220, stock: 38, season: "winter", images: [photo("photo-1601924994987-69e26d50dc26")], description: "A soft, warm scarf in an easy-to-style seasonal shade.", isBestSeller: true },
    { name: "Classic Sunglasses", cat: "Accessories", sub: "Sunglasses", price: 390, stock: 32, season: "summer", images: [photo("photo-1511499767150-a48a237f0083")], description: "A refined everyday frame with a timeless profile.", isNewArrival: true },
  ];

  let productsCreated = 0;
  let productsUpdated = 0;

  for (const def of productDefs) {
    const slug = slugify(def.name);
    const category = categoriesByName[def.cat];
    const subCategory = subcategoriesByKey[`${def.cat}:${def.sub}`];
    const productData = {
      name: def.name,
      description: def.description,
      price: def.price,
      images: def.images,
      categoryId: category._id,
      subCategoryId: subCategory._id,
      season: def.season,
      slug,
      stockQuantity: def.stock,
      isActive: true,
      isDeleted: false,
      isBestSeller: Boolean(def.isBestSeller),
      isNewArrival: Boolean(def.isNewArrival),
    };

    const existing = await Product.findOne({ slug });
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: productData });
      productsUpdated += 1;
      continue;
    }

    await Product.create(productData);
    productsCreated += 1;
  }

  console.log(`Created ${productsCreated} products and refreshed ${productsUpdated} existing products.`);

  const faqDefs = [
    { question: "How long does delivery take?", answer: "Orders are typically delivered within 2-5 business days depending on your location." },
    { question: "What payment methods do you accept?", answer: "We currently accept cash on delivery for all orders." },
    { question: "Can I return or exchange an item?", answer: "Yes, items can be returned within 14 days of delivery, provided they are unused and in original packaging." },
    { question: "How do I track my order?", answer: "You can track your order status anytime from the 'My Orders' section of your account." },
    { question: "Do you ship outside Egypt?", answer: "Currently we only deliver within Egypt. International shipping is coming soon." },
    { question: "How can I cancel an order?", answer: "You can cancel an order from the order details page as long as it hasn't been confirmed for shipping yet." },
  ];

  let faqsCreated = 0;
  for (const def of faqDefs) {
    const existing = await FAQ.findOne({ question: def.question });
    if (!existing) {
      await FAQ.create({ ...def, isActive: true });
      faqsCreated += 1;
    }
  }
  console.log(`Created ${faqsCreated} FAQs (skipped existing).`);

  const testimonialDefs = [
    { message: "Amazing quality and super fast delivery. Will definitely order again!", rating: 5, status: "approved" },
    { message: "The clothes look exactly like the pictures. Very happy with my purchase.", rating: 5, status: "approved" },
    { message: "Good products overall, but delivery took a bit longer than expected.", rating: 4, status: "approved" },
    { message: "Great customer service and easy returns process.", rating: 5, status: "pending" },
    { message: "Nice variety of styles, prices are reasonable too.", rating: 4, status: "pending" },
  ];

  let testimonialsCreated = 0;
  for (let i = 0; i < testimonialDefs.length; i++) {
    const def = testimonialDefs[i];
    const user = customers[i % customers.length];

    const existing = await Testimonial.findOne({ userId: user._id, message: def.message });
    if (!existing) {
      await Testimonial.create({ ...def, userId: user._id });
      testimonialsCreated += 1;
    }
  }
  console.log(`Created ${testimonialsCreated} testimonials (skipped existing).`);

  console.log("\nSeeding complete!");
  console.log("--------------------------------------------------");
  console.log("Admin login   -> eslam@gmail.com / eslam@123");
  console.log("Customer login-> ahmed@gmail.com / Customer@123");
  console.log("--------------------------------------------------");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
