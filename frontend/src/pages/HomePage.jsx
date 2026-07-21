const categories = [
  { href: "/jeans", name: "Jeans", imageUrl: "/frontend/public/jeans.jpg" },
  { href: "/tshirts", name: "T-shirts", imageUrl: "/frontend/public/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imageUrl: "/frontend/public/shoes.jpg" },
  { href: "/glasses", name: "Glasses", imageUrl: "/frontend/public/glasses.png" },
  { href: "/jackets", name: "Jackets", imageUrl: "/frontend/public/jackets.jpg" },
  { href: "/suits", name: "Suits", imageUrl: "/frontend/public/suits.jpg" },
  { href: "/bags", name: "Bags", imageUrl: "/frontend/public/bags.jpg" }, 
]

// store Home page
const HomePage = () => {
  return (
    <div>
      <div className="bg-gray-900">
        <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">Categories</h2>
    </div>
  )
}

export default HomePage