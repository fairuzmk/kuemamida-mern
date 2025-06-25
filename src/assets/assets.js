import menu_1 from './Menukuemamidakueultah.png'
import menu_2 from './Menukuemamidakuebolen.png'
import menu_3 from './Menukuemamidakuebrownies.png'
import menu_4 from './Menukuemamidacakepotong.png'
import menu_5 from './Menukuemamidarisol.png'
import menu_6 from './Menukuemamidakuekering.png'
import menu_7 from './Menukuemamidasnackbox.png'
import coverImg from './brownies.png'

export const menu_list = [
    {
        menu_name: "Kue Ultah",
        menu_image: menu_1
    },
    {
        menu_name: "Kue Bolen",
        menu_image: menu_2
    },
    {
        menu_name: "Kue Brownies",
        menu_image: menu_3
    },
    {
        menu_name: "Cake Potong",
        menu_image: menu_4
    },
    {
        menu_name: "Kue Risol",
        menu_image: menu_5
    },
    {
        menu_name: "Kue Kering",
        menu_image: menu_6
    },
    {
        menu_name: "Snack Box",
        menu_image: menu_7
    }
]

const categories = ["Kue Ultah", "Kue Kering", "Cake Potong"];

export const food_list = Array.from({ length: 10 }, (_, i) => ({
    _id: `${i + 1}`,
    name: `Makanan ${i + 1}`,
    image: coverImg,
    price: 10000 + i * 1000,
    description: `Deskripsi makanan ${i + 1} \nUkuran: 20cm \nRasa: Keju`,
    category: categories[Math.floor(Math.random() * categories.length)],
    stock: 100,
    rating: 4.5,
    inStock: true
  }));


//format dari youtuobe
export const food_listformat = [
    {
        _id: "1",
        name: "",
        image: "",
        price: "",
        description: "",
        category: categories[Math.floor(Math.random() * categories.length)]
    },
    
]