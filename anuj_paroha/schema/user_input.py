from pydantic import BaseModel, Field
from typing import Optional, Annotated, Literal


class DATA(BaseModel):
    area: Annotated[int, Field(..., gt=0, description="Area (in sq ft) of the House")]
    bedrooms: int = Field(..., example=3, description="Number of bedrooms")
    bathrooms: int = Field(..., ge=0, description="Number of bathrooms")
    stories: int = Field(..., ge=0, description="Number of stories")
    mainroad: Optional[Literal["yes", "no"]] = Field(default="no", description="If house is on the main road")
    guestroom: Optional[Literal["yes", "no"]] = Field(default="no", description="If guest room is present")
    basement: Optional[Literal["yes", "no"]] = Field(default="no", description="If basement is present")
    hotwaterheating: Optional[Literal["yes", "no"]] = Field(default="no", description="If hot water heating is present")
    airconditioning: Optional[Literal["yes", "no"]] = Field(default="no", description="If air conditioning is present")
    parking: Optional[int] = Field(default=0, ge=0, description="Number of parking spaces")
    prefarea: Optional[Literal["yes", "no"]] = Field(default="no", description="If the house is in a preferred area")
    furnishingstatus: Optional[Literal["furnished", "semi-furnished", "unfurnished"]] = Field(
        default="unfurnished", description="Furnishing status of the house"
    )
