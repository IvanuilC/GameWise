FROM  python:3.8.13-bullseye

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

COPY requirements.txt /backend/
RUN pip install -r requirements.txt

COPY . /backend

EXPOSE 8000
