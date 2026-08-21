from pydantic import BaseModel


class SubjectCreate(BaseModel):
    name: str
    description: str | None = None


class SubjectResponse(BaseModel):
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    title: str
    content: str
    subject_id: int


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    subject_id: int

    class Config:
        from_attributes = True