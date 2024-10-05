
import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { IoMdClose } from 'react-icons/io';
import SearchIcon from '@mui/icons-material/Search';

const TransformationPanel = ({
  dataSource,
  searchValue,
  searchProject,
  handleClick,
  transformList,
  handleNode,
  text,
  openPopUp,
}) => {
  return (
    <div
      className="rounded w-25 shadow-sm"
      style={{
        marginTop: '10px',
        padding: '10px',
        border: '1px solid #f2f2f2',
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 1000,
      }}
    >
      <div className="d-flex justify-content-end h6 fw-bold">
        <div onClick={handleClick}>
          <IoMdClose />
        </div>
      </div>
      {dataSource?.length > 0 && (
        <TextField
          className="my-1"
          value={searchValue}
          onChange={searchProject}
          id="left-search"
          fullWidth
          size="small"
          placeholder="Search By keywords"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
      <div
        style={{
          height: '380px',
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {transformList?.map((item, index) => (
          <div
            onClick={() => handleNode(item.lead, item.title, 0)}
            className="bg-box d-flex p-2 rounded align-items-center my-2"
            key={index}
          >
            <img src={item.lead} alt="" width={40} className="mx-2" />
            <img src={item.line} alt="" className="mx-2" width={8} />
            <div className="fw-bold m-0">{item?.title}</div>
          </div>
        ))}
      </div>
      {text === 'Source' && (
        <div className="m-auto text-center mff">
          <button
            onClick={openPopUp}
            type="button"
            className="btn btn-dark p-2"
          >
            Configure A New Source <span className="h5">+</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TransformationPanel;