import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./swal.css";

const themedSwal = Swal.mixin({
  background: "transparent",
  color: "#f5f5f5",
  buttonsStyling: false,
  reverseButtons: false,
  customClass: {
    popup: "app-swal-popup",
    title: "app-swal-title",
    htmlContainer: "app-swal-html",
    confirmButton: "app-swal-confirm",
    cancelButton: "app-swal-cancel",
    denyButton: "app-swal-deny",
    actions: "app-swal-actions",
    icon: "app-swal-icon",
    closeButton: "app-swal-close",
    input: "app-swal-input",
    validationMessage: "app-swal-validation",
  },
});

export default themedSwal;
