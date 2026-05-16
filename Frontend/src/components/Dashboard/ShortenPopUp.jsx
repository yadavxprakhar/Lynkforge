import Modal from "@mui/material/Modal";

import CreateNewShorten from "./CreateNewShorten";

const ShortenPopUp = ({ open, setOpen, refetch }) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-short-url-title"
      slotProps={{
        backdrop: {
          className:
            "backdrop-blur-sm !bg-slate-900/50 transition-opacity duration-200 dark:!bg-black/70",
        },
      }}
    >
      <div className="flex h-full w-full items-center justify-center p-4 outline-none">
        <CreateNewShorten setOpen={setOpen} refetch={refetch} />
      </div>
    </Modal>
  );
};

export default ShortenPopUp;
