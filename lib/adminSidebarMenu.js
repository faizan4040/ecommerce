import { MdSpaceDashboard } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { TbPaperBag } from "react-icons/tb";
import { GoPeople } from "react-icons/go";
import { MdOutlinePermMedia } from "react-icons/md";
import { CiStar } from "react-icons/ci";
import { RiCoupon2Fill } from "react-icons/ri";


export const adminAppSidebarMenu = [
    {
        title: "Dashboard",
        url: "ADMIN_DASHBOARD",
        icon: MdSpaceDashboard
    },

    {
        title: "Category",
        url: "#",
        icon: BiCategory,
        submenu:[
            {
                title: "Add Category",
                url: "#"
            },
            {
                title: "All Category",
                url: "#"
            }
        ]
    },

    {
        title: "Product",
        url: "#",
        icon: IoShirtOutline,
        submenu:[
            {
                title: "Add Product",
                url: "#"
            },
            {
                title: "Add Variant",
                url: "#"
            },
            {
                title: "Add Products",
                url: "#"
            },
            {
                title: "All Product",
                url: "#"
            },
        ]
    },

        {
        title: "Coupons",
        url: "#",
        icon: RiCoupon2Fill,
        submenu:[
            {
                title: "Add Coupon",
                url: "#"
            },
            {
                title: "All Coupons",
                url: "#"
            },
        ]
    },

    {
        title: "Orders",
        url: "#",
        icon: TbPaperBag,
    },

    {
        title: "Customers",
        url: "#",
        icon: GoPeople,
    },

    {
        title: "Rating & Review",
        url: "#",
        icon: CiStar,
    },


    {
        title: "Media",
        url: "#",
        icon: MdOutlinePermMedia,
    },
    

]