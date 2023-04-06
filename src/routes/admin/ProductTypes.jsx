import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  Page,
  Card,
  Tabs,
  Link,
  TextField,
  IndexTable,
  Loading,
  Icon,
  Text,
  Form,
  FormLayout,
  Scrollable,
  Pagination,
  Modal,
  EmptySearchResult,
  Toast,
  Tooltip,
  ButtonGroup,
  Button,
  TextContainer,
} from "@shopify/polaris";
import { SearchMinor, DeleteMinor, EditMinor } from "@shopify/polaris-icons";
import { AppContext } from "../../components/providers/ContextProvider";
import {
  SkeltonPageForTable,
  getAccessToken,
  InputField,
  CustomSelect,
  ShowPassword,
  HidePassword,
} from "../../components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function ProductTypes() {
  const { apiUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [productTypeLoading, setProductTypeLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [queryValue, setQueryValue] = useState("");
  const [toggleLoadData, setToggleLoadData] = useState(true);
  const [errorToast, setErrorToast] = useState(false);
  const [sucessToast, setSucessToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [productTypeModal, setProductTypeModal] = useState(false);
  const [deleteProductTypeModal, setDeleteProductTypeModal] = useState(false);
  const [productTypId, setProductTypId] = useState();
  const [isEditProductType, setIsEditProductType] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [productTypeStatus, setProductTypeStatus] = useState("");
  const [pagination, setPagination] = useState(1);
  const [showPagination, setShowPagination] = useState(false);
  const [paginationUrl, setPaginationUrl] = useState([]);

  const [newProductType, setNewProductType] = useState({
    name: "",
    status: true,
  });

  const handleNewProductType = (e) => {
    if (e.target.name == "status") {
      setNewProductType({
        ...newProductType,
        [e.target.name]: e.target.checked,
      });
    } else {
      setNewProductType({ ...newProductType, [e.target.name]: e.target.value });
    }
  };

  // ---------------------Tabs Code Start Here----------------------

  const handleTabChange = (selectedTabIndex) => {
    if (selectedTab != selectedTabIndex) {
      setSelectedTab(selectedTabIndex);
      if (selectedTabIndex == 0) {
        setProductTypeStatus("");
      } else if (selectedTabIndex == 1) {
        setProductTypeStatus("active");
      } else if (selectedTabIndex == 2) {
        setProductTypeStatus("draft");
      }
      setProductTypeLoading(true);
      setToggleLoadData(true);
    }
  };

  const tabs = [
    {
      id: "all-types",
      content: "All",
    },
    {
      id: "active-types",
      content: "Active",
    },
    {
      id: "draft-types",
      content: "Draft",
    },
  ];

  const handleProductModal = () => {
    setProductTypeModal(!productTypeModal);
    setIsEditProductType(false);
    setProductTypId();
    setNewProductType({
      name: "",
      status: true,
    });
  };

  // ------------------------Toasts Code start here------------------
  const toggleErrorMsgActive = useCallback(
    () => setErrorToast((errorToast) => !errorToast),
    []
  );
  const toggleSuccessMsgActive = useCallback(
    () => setSucessToast((sucessToast) => !sucessToast),
    []
  );

  const toastErrorMsg = errorToast ? (
    <Toast content={toastMsg} error onDismiss={toggleErrorMsgActive} />
  ) : null;

  const toastSuccessMsg = sucessToast ? (
    <Toast content={toastMsg} onDismiss={toggleSuccessMsgActive} />
  ) : null;

  function convertBooleanToNumber(value) {
    let booleanValue;
    if (value == true) {
      booleanValue = 1;
    } else {
      booleanValue = 0;
    }

    return booleanValue;
  }

  function convertNumberToBoolean(value) {
    let booleanValue;
    if (value == 1) {
      booleanValue = true;
    } else {
      booleanValue = false;
    }
    return booleanValue;
  }

  // ---------------------Tag/Filter Code Start Here----------------------
  const handleQueryValueRemove = () => {
    setQueryValue("");
    setToggleLoadData(true);
  };
  const handleFiltersQueryChange = (value) => {
    setQueryValue(value);
    setTimeout(() => {
      setToggleLoadData(true);
    }, 1000);
  };

  // ---------------------Index Table Code Start Here----------------------

  const resourceName = {
    singular: "Product Type",
    plural: "Product Types",
  };

  const rowMarkup = productTypes?.map(({ id, name, status }, index) => (
    <IndexTable.Row
      id={id}
      key={index}
      position={index}
      disabled={productTypeLoading}
    >
      <IndexTable.Cell className="Polaris-IndexTable-Product-Column">
        <Text variant="bodyMd" fontWeight="semibold" as="span">
          {name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <span
          className="small-tgl-btn"
          onClick={() => updateUserStatus(id, status)}
        >
          <input
            id={id}
            type="checkbox"
            className="tgl tgl-light"
            onChange={() => ""}
            checked={convertNumberToBoolean(status)}
          />
          <label htmlFor={id} className="tgl-btn"></label>
        </span>
      </IndexTable.Cell>

      <IndexTable.Cell className="Polaris-IndexTable-Delete-Column">
        <ButtonGroup>
          <Tooltip content="Edit Product Type">
            <Button
              onClick={() => handleEditProductType(id)}
              loading={btnLoading[id]}
            >
              <Icon source={EditMinor}></Icon>
            </Button>
          </Tooltip>

          <Tooltip content={"Delete Product Type"}>
            <Button
              onClick={() => handleDeleteProductType(id)}
              disabled={btnLoading[id]}
            >
              <Icon source={DeleteMinor}></Icon>
            </Button>
          </Tooltip>
        </ButtonGroup>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  const emptyStateMarkup = (
    <EmptySearchResult title={"No Product Type Found"} withIllustration />
  );

  const handleDeleteProductType = (id) => {
    setProductTypId(id);
    setDeleteProductTypeModal(true);
  };

  const handleDeleteProductTypeModal = () => {
    setDeleteProductTypeModal(!deleteProductTypeModal);
    setProductTypId();
  };

  const handlePaginationTabs = (active, url) => {
    if (!active && url != null) {
      let link = url.split("page=")[1];
      setPagination(link);
      setToggleLoadData(true);
    }
  };

  const ConvertStr = ({ value }) => {
    let label = value.replace("&raquo;", "»").replace("&laquo;", "«");
    return label;
  };

  // ---------------------Api Code starts Here----------------------

  const getProductTypes = async () => {
    setProductTypeLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/product/types?status=${productTypeStatus}&page=${pagination}&query=${queryValue}`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      //   console.log("getProductTypes response: ", response.data?.productTypes);
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        setProductTypes(response.data?.product_types?.data);
        setPaginationUrl(response.data.product_types?.links);
        if (
          response.data.product_types?.total >
          response.data.product_types?.per_page
        ) {
          setShowPagination(true);
        } else {
          setShowPagination(true);
        }
        setLoading(false);
        setProductTypeLoading(false);
        setToggleLoadData(false);
      }
    } catch (error) {
      console.warn("getProductTypes Api Error", error.response);
      setLoading(false);
      setProductTypeLoading(false);
      if (error.response?.message) {
        setToastMsg(error.response?.message);
      } else {
        setToastMsg("Something Went Wrong, Try Again!");
      }
      setToggleLoadData(false);
      setErrorToast(true);
    }
  };

  const deleteProductType = async () => {
    setBtnLoading((prev) => {
      let toggleId;
      if (prev["deleteProductType"]) {
        toggleId = { ["deleteProductType"]: false };
      } else {
        toggleId = { ["deleteProductType"]: true };
      }
      return { ...toggleId };
    });
    try {
      const response = await axios.post(
        `${apiUrl}/api/product/type/delete/${productTypId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );
      // console.log("response", response?.data);
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        setToastMsg(response?.data?.message);
        setSucessToast(true);
        setDeleteProductTypeModal(false);
        setProductTypId();
        setToggleLoadData(true);
      }
      setBtnLoading(false);
    } catch (error) {
      console.warn("deleteProductType Api Error", error.response);
      setBtnLoading(false);
      if (error.response?.message) {
        setToastMsg(error.response?.message);
      } else {
        setToastMsg("Something Went Wrong, Try Again!");
      }
      setErrorToast(true);
    }
  };

  useEffect(() => {
    if (toggleLoadData) {
      getProductTypes();
    }
  }, [toggleLoadData]);

  const handleAddNewUser = () => {
    document.getElementById("addNewProductTypeForm").click();
  };

  const addNewProductType = async (e) => {
    e.preventDefault();
    setBtnLoading((prev) => {
      let toggleId;
      if (prev["addProductType"]) {
        toggleId = { ["addProductType"]: false };
      } else {
        toggleId = { ["addProductType"]: true };
      }
      return { ...toggleId };
    });

    let data = {
      name: newProductType.name,
      status: newProductType.status,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api/product/type/save`,
        data,
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("addNewProductType response: ", response.data);

      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        setBtnLoading(false);
        setToastMsg(response.data?.message);
        setSucessToast(true);
        setProductTypeModal(false);
        setToggleLoadData(true);
        handleProductModal();
      }

      setBtnLoading(false);
    } catch (error) {
      console.warn("addNewProductType Api Error", error.response);
      setBtnLoading(false);
      if (error.response?.message) {
        setToastMsg(error.response?.message);
      } else {
        setToastMsg("Something Went Wrong, Try Again!");
      }
      setErrorToast(true);
    }
  };

  const handleEditProductType = (id) => {
    setProductTypId(id);
    setProductTypeLoading(true);
    editProductType(id);
  };

  const editProductType = async (id) => {
    setProductTypeLoading(true);
    setBtnLoading((prev) => {
      let toggleId;
      if (prev[id]) {
        toggleId = { [id]: false };
      } else {
        toggleId = { [id]: true };
      }
      return { ...toggleId };
    });
    try {
      const response = await axios.post(
        `${apiUrl}/api/product/type/details/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("editProductType response: ", response.data);
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        let productTypeResponse = response.data?.product_type;
        setProductTypId(productTypeResponse?.id);
        setNewProductType({
          name: productTypeResponse?.name,
          status: convertNumberToBoolean(productTypeResponse?.status),
        });
        setIsEditProductType(true);
        setProductTypeModal(true);
      }
      setProductTypeLoading(false);
      setBtnLoading(false);
    } catch (error) {
      console.warn("editProductType Api Error", error.response);
      setBtnLoading(false);
      if (error.response?.message) {
        setToastMsg(error.response?.message);
      } else {
        setToastMsg("Something Went Wrong, Try Again!");
      }
      setErrorToast(true);
    }
  };

  const updateUserStatus = async (id, value) => {
    let enableValue = "";
    if (value == 0) {
      enableValue = 1;
    } else {
      enableValue = 0;
    }

    let data = {
      status: enableValue,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api/product/type/status/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );
      if (response?.data?.success) {
        setToastMsg(response?.data?.message);
        setSucessToast(true);
      } else {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      }
      setToggleLoadData(true);
    } catch (error) {
      console.warn("updateUserStatus Api Error", error.response);
      if (error.response?.message) {
        setToastMsg(error.response?.message);
      } else {
        setToastMsg("Something Went Wrong, Try Again!");
      }
      setErrorToast(true);
    }
  };

  const updateProductType = async (e) => {
    e.preventDefault();
    setBtnLoading((prev) => {
      let toggleId;
      if (prev["addProductType"]) {
        toggleId = { ["addProductType"]: false };
      } else {
        toggleId = { ["addProductType"]: true };
      }
      return { ...toggleId };
    });

    let data = {
      name: newProductType.name,
      status: newProductType.status,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api/product/type/update/${productTypId}`,
        data,
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("updateProductType response: ", response.data);

      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        setBtnLoading(false);
        setToastMsg(response.data?.message);
        setSucessToast(true);
        handleProductModal();
        setToggleLoadData(true);
      }

      setBtnLoading(false);
    } catch (error) {
      console.warn("updateProductType Api Error", error.response);
      setBtnLoading(false);
      if (error.response?.message) {
        setToastMsg(error.response?.message);
      } else {
        setToastMsg("Something Went Wrong, Try Again!");
      }
      setErrorToast(true);
    }
  };

  return (
    <div className="Products-Page IndexTable-Page Orders-page Markets-Page">
      <Modal
        open={productTypeModal}
        onClose={handleProductModal}
        title={isEditProductType ? "Edit Product Type" : "Add New Product Type"}
        primaryAction={{
          content: isEditProductType ? "Update" : "Add",
          loading: btnLoading["addProductType"],
          onAction: handleAddNewUser,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            disabled: btnLoading["addProductType"],
            onAction: handleProductModal,
          },
        ]}
      >
        <Modal.Section>
          <Form
            onSubmit={isEditProductType ? updateProductType : addNewProductType}
          >
            <div className="Sheet-Container Payment-Sheet">
              <Scrollable className="Sheet-Market">
                <FormLayout>
                  <span className="VisuallyHidden">
                    <Button submit id="addNewProductTypeForm">
                      Submit
                    </Button>
                  </span>

                  <InputField
                    type="text"
                    label="Product Type Name"
                    name="name"
                    value={newProductType.name}
                    onChange={handleNewProductType}
                    autoComplete="off"
                    required
                    placeholder="Enter Product Type Name"
                  />

                  <span className="Modal-Select">
                    <label htmlFor="productTypeStatus">Status</label>
                    <input
                      id="productTypeStatus"
                      type="checkbox"
                      name="status"
                      className="tgl tgl-light"
                      checked={newProductType.status}
                      onChange={handleNewProductType}
                    />
                    <label
                      htmlFor="productTypeStatus"
                      className="tgl-btn"
                    ></label>
                  </span>
                </FormLayout>
              </Scrollable>
            </div>
          </Form>
        </Modal.Section>
      </Modal>

      <Modal
        small
        open={deleteProductTypeModal}
        onClose={handleDeleteProductTypeModal}
        title="Delete Product Type"
        loading={btnLoading["deleteProductType"]}
        primaryAction={{
          content: "Delete",
          destructive: true,
          disabled: btnLoading["deleteProductType"],
          onAction: deleteProductType,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            disabled: btnLoading["deleteProductType"],
            onAction: handleDeleteProductTypeModal,
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>Are you sure? This action can not be undone.</p>
          </TextContainer>
        </Modal.Section>
      </Modal>

      {loading ? (
        <span>
          <Loading />
          <SkeltonPageForTable />
        </span>
      ) : (
        <Page
          fullWidth
          title="Product Types"
          primaryAction={{
            content: "Add Product Type",
            onAction: handleProductModal,
          }}
        >
          <Card>
            <Tabs
              tabs={tabs}
              selected={selectedTab}
              onSelect={handleTabChange}
              disclosureText="More views"
            >
              <div className="Polaris-Table">
                <Card.Section>
                  <div style={{ padding: "16px", display: "flex" }}>
                    <div style={{ flex: 1 }}>
                      <TextField
                        placeholder="Search Product Type"
                        value={queryValue}
                        onChange={handleFiltersQueryChange}
                        clearButton
                        onClearButtonClick={handleQueryValueRemove}
                        autoComplete="off"
                        prefix={<Icon source={SearchMinor} />}
                      />
                    </div>
                  </div>

                  <IndexTable
                    resourceName={resourceName}
                    itemCount={productTypes?.length}
                    hasMoreItems
                    selectable={false}
                    loading={productTypeLoading}
                    emptyState={emptyStateMarkup}
                    headings={[
                      { title: "Name" },
                      { title: "Active/Draft" },
                      { title: "" },
                    ]}
                  >
                    {rowMarkup}
                  </IndexTable>
                </Card.Section>

                {productTypes?.length > 0 && showPagination && (
                  <Card.Section>
                    <div className="data-table-pagination Pagination-Section">
                      {paginationUrl?.map((item) => {
                        return (
                          <Button
                            disabled={item.url === null}
                            primary={item.active}
                            onClick={() =>
                              handlePaginationTabs(item.active, item.url)
                            }
                          >
                            <ConvertStr value={item.label} />
                          </Button>
                        );
                      })}
                    </div>
                  </Card.Section>
                )}
              </div>
            </Tabs>
          </Card>
        </Page>
      )}
      {toastErrorMsg}
      {toastSuccessMsg}
    </div>
  );
}
