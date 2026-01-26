
import { NextResponse } from "next/server";



export const response = (success, statusCode, message, data = {}) => {
  return NextResponse.json({
    success,
    statusCode,
    message,
    data,
  })
}

export const catchError = (error, customMessage ) => {
  // handleing duplicate key error
  if(error.code == 11000){
    const keys = Object.keys(error.keyPattern).join(',');
    error.message = `Duplicate field: ${keys}. These field value must be unique.`;
  }
  
  let errorObj = {}

  if(process.env.NODE_ENV === 'development'){
    errorObj = {
      message: error.message,
      error
    }
  } else {
      errorObj = {
      message: customMessage || 'Internal server error.',
    }
  }

// return response(false, error.code || 500, errorObj)
return NextResponse.json({
  success: false,
  statusCode: error.code,
  ...errorObj
})
}


export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 90000).toString()
  return otp
}





// export const columnConfig = (column, isCreatedAt = false, isUpdatedAt = false, isDeletedAt= false) =>{
//    const newColumn = [...column]

//    if(isCreatedAt) {
//     newColumn.push({
//       accessorkey: 'createdAt',
//       header: 'Created At',
//       cell: ({ renderedCellValue }) => (new Date(renderedCellValue).
//       toLocaleString())
//     })
//    }
   
//    if(isUpdatedAt){
//      newColumn.push({
//       accessorkey: 'updatedAt',
//       header: 'Updated At',
//       cell: ({renderCellValue}) => (new Date(renderCellValue).toLocaleString())
//      })
//    }


//    if(isDeletedAt){
//      newColumn.push({
//       accessorkey: 'deletedAt',
//       header: 'Deleted At',
//       cell: ({renderCellValue}) => (new Date(renderCellValue).toLocaleString())
//      })
//    }

//    return newColumn
// }


export const columnConfig = (
  columns,
  isCreatedAt = false,
  isUpdatedAt = false,
  isDeletedAt = false
) => {
  const newColumns = [...columns]

  if (isCreatedAt) {
    newColumns.push({
      accessorKey: 'createdAt',   // ✅ FIXED
      header: 'Created At',
      cell: ({ renderedCellValue }) =>
        new Date(renderedCellValue).toLocaleString(),
    })
  }

  if (isUpdatedAt) {
    newColumns.push({
      accessorKey: 'updatedAt',   // ✅ FIXED
      header: 'Updated At',
      cell: ({ renderedCellValue }) =>
        new Date(renderedCellValue).toLocaleString(),
    })
  }

  if (isDeletedAt) {
    newColumns.push({
      accessorKey: 'deletedAt',   // ✅ FIXED
      header: 'Deleted At',
      cell: ({ renderedCellValue }) =>
        new Date(renderedCellValue).toLocaleString(),
    })
  }

  return newColumns
}
