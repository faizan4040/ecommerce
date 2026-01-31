import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IMAGES } from "@/routes/Images"
import { IoStar } from "react-icons/io5"

const LatestReview = () => {
  return (
    <Card className="rounded-2xl shadow-sm h-full">
      
      {/* CARD HEADER */}
      <CardHeader className="px-6 py-4 border-b">
        <CardTitle className="text-lg font-semibold">
          Latest Reviews
        </CardTitle>
      </CardHeader>

      {/* CARD CONTENT */}
      <CardContent className="p-0">
        {/* SCROLL CONTAINER */}
        <div className="max-h-75 overflow-y-auto">
          <Table>
            {/* STICKY HEADER */}
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 20 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  
                  {/* PRODUCT */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={IMAGES.profile} />
                      </Avatar>

                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          Product Name {index + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Lorem ipsum dolor amet
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* RATING */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IoStar
                          key={i}
                          className="text-yellow-500 text-sm"
                        />
                      ))}
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default LatestReview
