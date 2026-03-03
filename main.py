import eel

eel.init("www")

eel.start(
    "index.html",
    mode="edge",
    host="localhost",
    port=9000,
    size=(1600, 1200),
    block=True
)