from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[DataT] = None
    error: Optional[str] = None
