import { Button, TextField } from "@mui/material";

export const ConnectForm = ({
  connectToVideo,
  setUserName,
  setChannelName,
}) => {
  return (
    <div className="flex justify-center items-center min-h-[90vh]">
      <form
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
        onSubmit={connectToVideo}
      >
        <div className="mb-4">
          <TextField
            id="outlined-basic"
            label="Name"
            variant="standard"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>
        <div className="mb-8">
          <TextField
            id="outlined-basic"
            label="Room Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            variant="standard"
            onChange={(e) => setChannelName(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="contained">
          Connect
        </Button>
      </form>
    </div>
  );
};
