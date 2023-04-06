import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useMemo,
} from "react";
import {
  Page,
  Card,
  Scrollable,
  Stack,
  Button,
  PageActions,
  Form,
  FormLayout,
  Banner,
  Icon,
  Toast,
  Loading,
  List,
  TextContainer,
  Tag,
  Modal,
  OptionList,
  Autocomplete,
  Listbox,
  AutoSelection,
  Combobox,
  Badge,
  Layout,
  Text,
} from "@shopify/polaris";
import {
  SearchMinor,
  ChevronDownMinor,
  ChevronUpMinor,
} from "@shopify/polaris-icons";
import {
  SkeltonPageForProductDetail,
  getAccessToken,
  InputField,
  ShowPassword,
  HidePassword,
  CustomSelect,
  CheckBox,
  CustomBadge,
} from "../../components";
import { AppContext } from "../../components/providers/ContextProvider";
import { useAuthState } from "../../components/providers/AuthProvider";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import EmptyCheckBox from "../../assets/icons/EmptyCheckBox.png";
import FillCheckBox from "../../assets/icons/FillCheckBox.png";
import CheckboxTree from "react-checkbox-tree";
import { LogarithmicScale } from "chart.js";

export function VendorDetail() {
  const params = useParams();
  const { apiUrl } = useContext(AppContext);
  const { user } = useAuthState();
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggleLoadData, setToggleLoadData] = useState(true);
  const [errorToast, setErrorToast] = useState(false);
  const [sucessToast, setSucessToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorStatus, setVendorStatus] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [discardModal, setDiscardModal] = useState(false);
  const [vendorsList, setVendorsList] = useState([]);
  const [vendorError, setVendorError] = useState();
  const [marketsList, setMarketsList] = useState([]);
  const [productTypesList, setProductTypesList] = useState([]);

  const [selectedTags, setSelectedTags] = useState([]);
  const [comboBoxValue, setComboBoxValue] = useState("");

  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [newVendor, setNewVendor] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    cPassword: "",
    status: true,
    address_line1: "",
    address_line2: "",
    state: "",
    city: "",
    zipCode: "",
    market_id: null,
  });

  const handleNewVendorDetails = (e) => {
    setNewVendor({ ...newVendor, [e.target.name]: e.target.value });
    if (e.target.name == "password" || e.target.name == "cPassword") {
      setPasswordErrorMsg("");
    }
  };

  const updateSelection = useCallback(
    (selected, id) => {
      const tagsFromSelectedId = selectedTags[id] ? selectedTags[id] : [];
      const nextSelectedTags = selected && new Set([...tagsFromSelectedId]);
      if (nextSelectedTags.has(selected)) {
        nextSelectedTags.delete(selected);
      } else {
        nextSelectedTags.add(selected);
      }
      setSelectedTags({ ...selectedTags, [id]: [...nextSelectedTags] });
      setComboBoxValue({ ...comboBoxValue, [id]: "" });
    },
    [selectedTags]
  );

  const handleZipInputs = (value, id) => {
    setComboBoxValue({ ...comboBoxValue, [id]: value });
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

  const discardVendor = () => {
    navigate("/vendors");
  };

  const handleDiscardModal = () => {
    setDiscardModal(!discardModal);
  };

  const getMarketsList = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/markets/list`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("getMarketsList response: ", response.data);
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        let list = [];
        response.data?.markets?.map((item) => {
          list.push({
            value: item.id,
            label: item.name,
          });
        });
        setMarketsList(list);
      }
    } catch (error) {
      console.warn("Get VendorsList Api Error", error.response);
      setBtnLoading(false);
      if (error.response?.message) {
        setToastMsg(error.response?.message);
      } else {
        setToastMsg("Something Went Wrong, Please Reload the page!");
      }
      setErrorToast(true);
    }
  };

  useEffect(() => {
    getMarketsList();
  }, []);

  const editVendor = async (id) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/vendor/detail/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log(
      //   "editVendor response: ",
      //   response.data?.vendor?.product_types
      // );
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        let productTypesResponse = response.data?.list_product_type;
        let vendorResponse = response.data?.vendor;
        setVendorId(vendorResponse?.id);
        setVendorName(vendorResponse?.name);
        setVendorStatus(vendorResponse?.status);
        setNewVendor({
          ...newVendor,
          first_name: vendorResponse?.first_name,
          last_name: vendorResponse?.last_name,
          email: vendorResponse?.email,
          phone: vendorResponse?.phone,
          market_id: vendorResponse?.market
            ? vendorResponse?.market?.details?.id
            : null,
          city: vendorResponse?.details?.city,
          zipCode: vendorResponse?.details?.zipCode,
          state: vendorResponse?.details?.state,
          address_line1: vendorResponse?.details?.address_line1,
          address_line2: vendorResponse?.details?.address_line2,
          status: vendorResponse?.status,
        });
        let list = [];
        productTypesResponse?.map((item) => {
          list.push({
            id: item.id,
            name: item.name,
          });
        });
        setProductTypesList(list);

        if (vendorResponse.product_types?.length) {
          const emptyArrays = vendorResponse.product_types?.reduce(
            (result, { product_type_id, zipcodes }) => {
              result[product_type_id] = zipcodes ? JSON.parse(zipcodes) : [];
              return result;
            },
            {}
          );
          setSelectedTags(emptyArrays);
        }

        if (vendorResponse?.product_types?.length > 0) {
          const emptyArrays = vendorResponse.product_types?.reduce(
            (result, { product_type_id, zipcodes }) => {
              result[product_type_id] = zipcodes ? JSON.parse(zipcodes) : [];
              return result;
            },
            {}
          );
          setSelectedTags(emptyArrays);
        } else {
          const emptyArrays = productTypesResponse.reduce((result, { id }) => {
            result[id] = [];
            return result;
          }, {});
          setSelectedTags(emptyArrays);
        }

        setLoading(false);
        setToggleLoadData(false);
        window.scrollTo(0, 0);
      }

      setBtnLoading(false);
    } catch (error) {
      console.warn("editVendor Api Error", error.response);
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
      editVendor(params.vendorId);
    }
  }, [toggleLoadData]);

  const handleUpdateVendor = () => {
    document.getElementById("updateVendorForm").click();
  };

  const handleUpdateVendorSubmit = (e) => {
    e.preventDefault();
    if (newVendor.password.length < 8) {
      setPasswordErrorMsg("Password must be 8 digits long");
      window.scrollTo(0, 400);
    } else {
      if (newVendor.password != newVendor.cPassword) {
        setPasswordErrorMsg("Password must match");
        window.scrollTo(0, 400);
      } else {
        if (newVendor.market_id) {
          setVendorError();
          updateVendor();
        } else {
          setVendorError("market");
          window.scrollTo(0, 0);
        }
      }
    }
  };

  const updateVendor = async () => {
    setBtnLoading((prev) => {
      let toggleId;
      if (prev["updateVendor"]) {
        toggleId = { ["updateVendor"]: false };
      } else {
        toggleId = { ["updateVendor"]: true };
      }
      return { ...toggleId };
    });
    const types = productTypesList.map((item) => item.id);
    const sortedTypes = types.sort((a, b) => a - b);
    const sortedKeys = Object.keys(selectedTags).sort((a, b) => a - b);
    const soertedZip = sortedKeys.map((key) => selectedTags[key]);

    let data = {
      first_name: newVendor.first_name,
      last_name: newVendor.last_name,
      email: newVendor.email,
      phone: newVendor.phone,
      password: newVendor.password,
      password_confirmation: newVendor.cPassword,
      status: newVendor.status,
      address_line1: newVendor.address_line1,
      address_line2: newVendor.address_line2,
      state: newVendor.state,
      city: newVendor.city,
      zipCode: newVendor.zipCode,
      market_id: newVendor.market_id,
      zipcodes: soertedZip,
      product_type_id: sortedTypes,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api/vendor/update/${vendorId}`,
        data,
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("updateVendor response: ", response.data);
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        setToastMsg("Market Updated Successfully!");
        setSucessToast(true);
        setToggleLoadData(true);
      }

      setBtnLoading(false);
    } catch (error) {
      console.warn("updateVendor Api Error", error.response);
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
    <div className="Vendor-Detail-Page">
      <Modal
        open={discardModal}
        onClose={handleDiscardModal}
        title="Leave page with unsaved changes?"
        primaryAction={{
          content: "Leave page",
          destructive: true,
          onAction: discardVendor,
        }}
        secondaryActions={[
          {
            content: "Stay",
            onAction: handleDiscardModal,
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>Leaving this page will delete all unsaved changes.</p>
          </TextContainer>
        </Modal.Section>
      </Modal>

      {loading ? (
        <span>
          <Loading />
          <SkeltonPageForProductDetail />
        </span>
      ) : (
        <Page
          fullWidth
          breadcrumbs={[{ content: "Vendor", onAction: handleDiscardModal }]}
          title={vendorName}
          titleMetadata={
            vendorStatus == 0 ? (
              <Badge status="info">Draft</Badge>
            ) : vendorStatus == 1 ? (
              <Badge status="success">Active</Badge>
            ) : null
          }
          primaryAction={{
            content: "Save Vendor",
            onAction: handleUpdateVendor,
            loading: btnLoading["updateVendor"],
          }}
        >
          {vendorError ? (
            <>
              <Banner
                title="There is 1 error with this Vendor:"
                status="critical"
              >
                <List>
                  {vendorError == "market" ? (
                    <List.Item>Market must be selected</List.Item>
                  ) : (
                    <List.Item>Specific {vendorError} must be added</List.Item>
                  )}
                </List>
              </Banner>
              <br />
            </>
          ) : (
            ""
          )}

          <Form onSubmit={handleUpdateVendorSubmit}>
            <span className="VisuallyHidden">
              <Button submit id="updateVendorForm">
                Submit
              </Button>
            </span>

            <Layout>
              <Layout.Section>
                <Card sectioned title="Personal Details">
                  <FormLayout>
                    <FormLayout.Group>
                      <InputField
                        type="text"
                        label="First Name"
                        name="first_name"
                        value={newVendor.first_name}
                        onChange={handleNewVendorDetails}
                        autoComplete="off"
                        required
                        placeholder="Enter First Name"
                      />
                      <InputField
                        type="text"
                        label="Last Name"
                        name="last_name"
                        value={newVendor.last_name}
                        onChange={handleNewVendorDetails}
                        autoComplete="off"
                        required
                        placeholder="Enter Last Name"
                      />
                    </FormLayout.Group>

                    <InputField
                      type="email"
                      label="Email"
                      name="email"
                      required
                      value={newVendor.email}
                      onChange={handleNewVendorDetails}
                      autoComplete="off"
                      placeholder="Enter Email"
                    />

                    <InputField
                      type="number"
                      label="Phone"
                      name="phone"
                      required
                      value={newVendor.phone}
                      onChange={handleNewVendorDetails}
                      autoComplete="off"
                      placeholder="Enter Phone"
                    />

                    <FormLayout.Group>
                      <div className="Icon-TextFiled">
                        <InputField
                          value={newVendor.password}
                          name="password"
                          onChange={handleNewVendorDetails}
                          label="Password"
                          type={hidePassword ? "password" : "text"}
                          autoComplete="off"
                          placeholder="Enter Password"
                          required
                          error={passwordErrorMsg}
                        />
                        <span
                          onClick={() => setHidePassword(!hidePassword)}
                          className="Icon-Section"
                        >
                          {hidePassword ? (
                            <Icon source={HidePassword} color="subdued" />
                          ) : (
                            <Icon source={ShowPassword} color="subdued" />
                          )}
                        </span>
                      </div>

                      <div className="Icon-TextFiled">
                        <InputField
                          value={newVendor.cPassword}
                          name="cPassword"
                          onChange={handleNewVendorDetails}
                          label="Confirm Password"
                          type={hidePassword ? "password" : "text"}
                          autoComplete="off"
                          placeholder="Enter Password"
                          required
                          error={passwordErrorMsg}
                        />
                        <span
                          onClick={() => setHidePassword(!hidePassword)}
                          className="Icon-Section"
                        >
                          {hidePassword ? (
                            <Icon source={HidePassword} color="subdued" />
                          ) : (
                            <Icon source={ShowPassword} color="subdued" />
                          )}
                        </span>
                      </div>
                    </FormLayout.Group>
                  </FormLayout>
                </Card>
                <Card sectioned title="Address Details">
                  <FormLayout>
                    <InputField
                      type="text"
                      label="City"
                      name="city"
                      value={newVendor.city}
                      onChange={handleNewVendorDetails}
                      autoComplete="off"
                      required
                      placeholder="Enter City"
                    />
                    <FormLayout.Group>
                      <InputField
                        type="text"
                        label="State"
                        name="state"
                        value={newVendor.state}
                        onChange={handleNewVendorDetails}
                        autoComplete="off"
                        required
                        placeholder="Enter State"
                      />
                      <InputField
                        type="text"
                        label="Zip Code"
                        name="zipCode"
                        value={newVendor.zipCode}
                        onChange={handleNewVendorDetails}
                        autoComplete="off"
                        required
                        placeholder="Enter Zip Code"
                      />
                    </FormLayout.Group>

                    <InputField
                      type="text"
                      label="Address 1"
                      name="address_line1"
                      multiline={"3"}
                      value={newVendor.address_line1}
                      onChange={handleNewVendorDetails}
                      autoComplete="off"
                      placeholder="Enter Address"
                    />

                    <InputField
                      type="text"
                      label="Address 2 (optional)"
                      name="address_line2"
                      multiline={"3"}
                      value={newVendor.address_line2}
                      onChange={handleNewVendorDetails}
                      autoComplete="off"
                      placeholder="Enter Address"
                    />
                  </FormLayout>
                </Card>
                <Card sectioned title="Zip Codes">
                  {productTypesList?.length ? (
                    <>
                      <Text as="p" color="subdued">
                        Enter Zip Codes in below Product Type fields
                      </Text>
                      <br />
                      {productTypesList?.map((item) => {
                        return (
                          <>
                            <Combobox
                              allowMultiple
                              activator={
                                <Combobox.TextField
                                  autoComplete="off"
                                  label={item.name}
                                  value={comboBoxValue[item.id]}
                                  placeholder="Enter Zip Codes"
                                  verticalContent={
                                    selectedTags[item.id]?.length > 0 ? (
                                      <Stack
                                        spacing="extraTight"
                                        alignment="center"
                                      >
                                        {selectedTags[item.id].map((tag) => (
                                          <Tag
                                            key={`option-${tag}`}
                                            onRemove={() =>
                                              updateSelection(tag, item.id)
                                            }
                                          >
                                            {tag}
                                          </Tag>
                                        ))}
                                      </Stack>
                                    ) : null
                                  }
                                  onChange={(e) => handleZipInputs(e, item.id)}
                                />
                              }
                            >
                              {comboBoxValue[item.id] ? (
                                <Listbox
                                  autoSelection={AutoSelection}
                                  onSelect={(selected) =>
                                    updateSelection(selected, item.id)
                                  }
                                >
                                  <Listbox.Action
                                    value={comboBoxValue[item.id]}
                                  >
                                    {`Add "${comboBoxValue[item.id]}"`}
                                  </Listbox.Action>
                                </Listbox>
                              ) : null}
                            </Combobox>
                            <br />
                          </>
                        );
                      })}
                    </>
                  ) : (
                    <Text as="p" color="subdued">
                      No Product Types Available
                    </Text>
                  )}
                </Card>
              </Layout.Section>
              <Layout.Section oneThird>
                <Card title="Vendor Status" sectioned>
                  <CustomSelect
                    name="status"
                    value={newVendor.status}
                    onChange={handleNewVendorDetails}
                    options={[
                      { label: "Active", value: "1" },
                      { label: "Draft", value: "0" },
                    ]}
                  />
                </Card>
                <Card title="Select Vendor Market" sectioned>
                  <CustomSelect
                    name="market_id"
                    value={newVendor.market_id}
                    onChange={handleNewVendorDetails}
                    options={marketsList}
                  />
                </Card>
              </Layout.Section>
            </Layout>
          </Form>

          <div className="Polaris-Product-Actions">
            <br />
            <PageActions
              primaryAction={{
                content: "Save Vendor",
                onAction: handleUpdateVendor,
                loading: btnLoading["updateVendor"],
              }}
            />
          </div>
        </Page>
      )}
      {toastErrorMsg}
      {toastSuccessMsg}
    </div>
  );
}
