export const handleStream = async (stream, emitter) => {
  try {
    for await (const chunk of stream) {
      emitter.emit("data", chunk);
    }

    emitter.emit("end");
  } catch (error) {
    emitter.emit("error", error);
  }
};