const RequiredLabel = ({ children }) => (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </div>
  );
  
  export default RequiredLabel;