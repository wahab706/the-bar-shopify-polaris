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
  Badge,
  Layout,
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
  CheckBox,
  CustomBadge,
  CustomSelect,
} from "../../components";
import { AppContext } from "../../components/providers/ContextProvider";
import { useAuthState } from "../../components/providers/AuthProvider";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import EmptyCheckBox from "../../assets/icons/EmptyCheckBox.png";
import FillCheckBox from "../../assets/icons/FillCheckBox.png";
import CheckboxTree from "react-checkbox-tree";

export function MarketDetail() {
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
  const [marketName, setMarketName] = useState("");
  const [marketStatus, setMarketStatus] = useState("");
  const [marketId, setMarketId] = useState("");
  const [discardModal, setDiscardModal] = useState(false);
  const [vendorsList, setVendorsList] = useState([]);
  const [marketError, setMarketError] = useState();

  const [newMarket, setNewMarket] = useState({
    name: "",
    slug: "",
    description: "",
    status: true,
  });

  const handleNewMarketDetails = (e) => {
    setNewMarket({ ...newMarket, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setNewMarket({
      ...newMarket,
      slug: newMarket.name?.replace(/\s+/g, "-").toLowerCase(),
    });
  }, [newMarket.name]);

  // -------------------Tags------------------------

  const [tagOptionsSelected, setTagOptionsSelected] = useState("");
  const [tagInputValue, setTagInputValue] = useState("");
  const [tagOptions, setTagOptions] = useState([]);
  const [tagsModal, setTagsModal] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const handleTagsModal = useCallback(
    () => setTagsModal(!tagsModal),
    [tagsModal]
  );

  const tagUpdateText = useCallback(
    (value) => {
      setTagInputValue(value);

      if (!optionsLoading) {
        setOptionsLoading(true);
      }

      setTimeout(() => {
        if (value === "") {
          let list = [];
          vendorsList?.map((item) => {
            list.push({
              value: item.id,
              label: item.name,
            });
          });
          setTagOptions(list);
          setOptionsLoading(false);
          return;
        }

        const filterRegex = new RegExp(value, "i");
        const resultOptions = vendorsList.filter((option) =>
          option.name.match(filterRegex)
        );
        let endIndex = resultOptions.length - 1;
        if (resultOptions.length === 0) {
          endIndex = 0;
        }
        let list = [];
        resultOptions?.map((item) => {
          list.push({
            value: item.id,
            label: item.name,
          });
        });
        setTagOptions(list);
        setOptionsLoading(false);
      }, 300);
    },
    [vendorsList, optionsLoading, tagOptionsSelected]
  );

  const removeTag = useCallback(
    (tag) => () => {
      const tagOptions = [...tagOptionsSelected];
      tagOptions.splice(tagOptions.indexOf(tag), 1);
      setTagOptionsSelected(tagOptions);
    },
    [tagOptionsSelected]
  );

  const tagsContentMarkup =
    tagOptionsSelected?.length > 0 &&
    vendorsList?.length &&
    tagOptions?.length ? (
      <div className="Product-Tags-Stack">
        <Stack spacing="extraTight" alignment="center">
          {tagOptionsSelected.map((option) => {
            let tagLabel = "";
            let title = vendorsList?.find((obj) => obj.id == option);
            if (title) {
              tagLabel = title.name;
            }
            tagLabel = tagLabel.replace("_", " ");
            tagLabel = tagTitleCase(tagLabel);
            return (
              <Tag key={`option${option}`} onRemove={removeTag(option)}>
                {tagLabel}
              </Tag>
            );
          })}
        </Stack>
      </div>
    ) : null;

  function tagTitleCase(string) {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join("");
  }

  const tagTextField = (
    <Autocomplete.TextField
      autoComplete="off"
      onChange={tagUpdateText}
      // label="Vendors"
      value={tagInputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="Select Vendors"
      // verticalContent={tagsContentMarkup}
    />
  );

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

  const discardMarket = () => {
    navigate("/markets");
  };

  const handleDiscardModal = () => {
    setDiscardModal(!discardModal);
  };

  // =================Countries Modal Code Start Here================
  const [expandedCountry, setExpandedCountry] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [allCountriesList, setAllCountriesList] = useState([]);
  const [checkedCountries, setCheckedCountries] = useState([]);
  const [checkedVariants, setCheckedVariants] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  const handleCheckedCountries = (checked) => {
    setCheckedCountries(checked);
  };

  useEffect(() => {
    setCountriesList(groupCountries(allCountriesList));
    // console.log("checkedCountries", checkedCountries);

    let country = [];
    let state = [];
    let city = [];
    allCountriesList.map((item) => {
      let list = checkedCountries?.find((d) => d == item.id);
      if (list) {
        country.push(item.id);
      }
      item.states?.map((item2) => {
        let list = checkedCountries?.find((d) => d == `s_${item2.id}`);
        if (list) {
          state.push(item2.id);
          country.push(Number(item2.country_id));
        }
        item2.cities?.map((item3) => {
          let list = checkedCountries?.find((d) => d == `c_${item3.id}`);
          if (list) {
            city.push(item3.id);
            state.push(Number(item3.state_id));
            country.push(Number(item3.country_id));
          }
        });
      });
    });

    setCheckedVariants({
      countries: [...new Set(country)],
      states: [...new Set(state)],
      cities: [...new Set(city)],
    });
  }, [allCountriesList, checkedCountries]);

  function groupCountries(data) {
    let arr = [];
    data?.map((item) => {
      let states = [];
      if (item.states?.length > 0) {
        item.states?.map((item2) => {
          let cities = [];
          if (item2.cities?.length > 0) {
            item2.cities?.map((item3) => {
              cities.push({
                value: `c_${item3.id}`,
                label: item3.name,
              });
            });
          }

          states.push({
            value: `s_${item2.id}`,
            label: item2.name,
            children: cities,
          });
        });
      }

      arr.push({
        value: item.id,
        label: item.name,
        children: states,
      });
    });

    return arr;
  }

  // useEffect(() => {
  //   console.log("checkedVariants", checkedVariants);
  // }, [checkedVariants]);

  // =================Countries Modal Code Ends Here================
  const getCounriesList = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/country`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("getCounriesList response: ", response.data?.countries);
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        setAllCountriesList(response.data?.countries);
        setCountriesList(groupCountries(response.data?.countries));
      }
    } catch (error) {
      console.warn("Get CounriesList Api Error", error.response);
      setBtnLoading(false);
      if (error.response?.message) {
        setToastMsg(error.response?.message);
      } else {
        setToastMsg("Something Went Wrong, Try Again!");
      }
      setErrorToast(true);
    }
  };

  const getVendorsList = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/vendors/list`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("getVendorsList response: ", response.data?.vendors);
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        setVendorsList(response.data?.vendors);
        let list = [];
        response.data?.vendors?.map((item) => {
          list.push({
            value: item.id,
            label: item.name,
          });
        });
        setTagOptions(list);
      }
    } catch (error) {
      console.warn("Get VendorsList Api Error", error.response);
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
    getCounriesList();
    getVendorsList();
  }, []);

  const editMarket = async (id) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/market/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("editMarket response: ", response.data);
      if (!response?.data?.success) {
        setToastMsg(response?.data?.message);
        setErrorToast(true);
      } else {
        let marketResponse = response.data?.market_detail;
        setMarketId(marketResponse?.id);
        setMarketName(marketResponse?.name);
        setMarketStatus(marketResponse?.status);
        setNewMarket({
          ...newMarket,
          name: marketResponse?.name,
          description: marketResponse?.description,
          slug: marketResponse?.slug,
          status: marketResponse?.status,
        });
        let list = [];
        marketResponse?.cities?.map((item) => {
          list.push(`c_${item.id}`);
        });
        marketResponse?.states?.map((item) => {
          list.push(`s_${item.id}`);
        });
        marketResponse?.countries?.map((item) => {
          list.push(`${item.id}`);
        });
        // console.log("get_list", list);
        setCheckedCountries(list);

        let vendors = [];
        marketResponse?.vendors?.map((vendor) => {
          vendors.push(vendor.id);
        });
        setTagOptionsSelected(vendors);

        setExpandedCountry();
        setLoading(false);
        setToggleLoadData(false);
        window.scrollTo(0, 0);
      }

      setBtnLoading(false);
    } catch (error) {
      console.warn("editMarket Api Error", error.response);
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
      editMarket(params.marketId);
    }
  }, [toggleLoadData]);

  const handleUpdateMarket = () => {
    document.getElementById("updateMarketForm").click();
  };

  const handleUpdateMarketSubmit = (e) => {
    e.preventDefault();
    if (checkedVariants.countries?.length && tagOptionsSelected?.length) {
      setMarketError();
      updateMarket();
    } else {
      if (!checkedVariants.countries?.length) {
        setMarketError("Country");
        window.scrollTo(0, 0);
      } else if (!tagOptionsSelected?.length) {
        setMarketError("Vendor");
        window.scrollTo(0, 0);
      }
    }
  };

  const updateMarket = async () => {
    setBtnLoading((prev) => {
      let toggleId;
      if (prev["updateMarket"]) {
        toggleId = { ["updateMarket"]: false };
      } else {
        toggleId = { ["updateMarket"]: true };
      }
      return { ...toggleId };
    });

    let data = {
      name: newMarket.name,
      description: newMarket.description,
      slug: newMarket.slug,
      toggle: newMarket.status,
      vendor_id: tagOptionsSelected,
      country_id: checkedVariants.countries,
      state_id: checkedVariants.states,
      city_id: checkedVariants.cities,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api/update/market/${marketId}`,
        data,
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      // console.log("updateMarket response: ", response.data);
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
      console.warn("updateMarket Api Error", error.response);
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
    <div className="  Market-Detail-Page">
      <Modal
        open={discardModal}
        onClose={handleDiscardModal}
        title="Leave page with unsaved changes?"
        primaryAction={{
          content: "Leave page",
          destructive: true,
          onAction: discardMarket,
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

      <Modal
        open={tagsModal}
        onClose={handleTagsModal}
        title="Manage Vendors"
        primaryAction={{
          content: "Done",
          onAction: () => {
            setTagsModal(false);
          },
        }}
      >
        <Modal.Section>
          <div className="Modal-Product-Tags">
            <Scrollable className="Market-Edit-Vendors-Scroll">
              <OptionList
                title="AVAILABLE"
                onChange={setTagOptionsSelected}
                options={tagOptions}
                selected={tagOptionsSelected}
                allowMultiple
              />
            </Scrollable>
          </div>
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
          breadcrumbs={[{ content: "Markets", onAction: handleDiscardModal }]}
          title={marketName}
          titleMetadata={
            marketStatus == 0 ? (
              <Badge status="info">Draft</Badge>
            ) : marketStatus == 1 ? (
              <Badge status="success">Active</Badge>
            ) : marketStatus == 2 ? (
              <Badge status="critical">Archived</Badge>
            ) : null
          }
          primaryAction={{
            content: "Save Market",
            onAction: handleUpdateMarket,
            loading: btnLoading["updateMarket"],
          }}
        >
          {marketError ? (
            <>
              <Banner
                title="There is 1 error with this Market:"
                status="critical"
              >
                <List>
                  <List.Item>Specific {marketError} must be added</List.Item>
                </List>
              </Banner>
              <br />
            </>
          ) : (
            ""
          )}

          <Form onSubmit={handleUpdateMarketSubmit}>
            <span className="VisuallyHidden">
              <Button submit id="updateMarketForm">
                Submit
              </Button>
            </span>
            <Layout>
              <Layout.Section>
                <Card sectioned title="General Information">
                  <FormLayout>
                    <FormLayout.Group>
                      <InputField
                        type="text"
                        label="Name"
                        name="name"
                        value={newMarket.name}
                        onChange={handleNewMarketDetails}
                        autoComplete="off"
                        required
                        placeholder="Enter Name"
                      />
                      <InputField
                        type="text"
                        label="Slug"
                        name="slug"
                        value={newMarket.slug}
                        onChange={handleNewMarketDetails}
                        autoComplete="off"
                        required
                        placeholder="Slug"
                      />
                    </FormLayout.Group>

                    <InputField
                      marginTop
                      type="text"
                      label="Description (optional)"
                      name="description"
                      value={newMarket.description}
                      onChange={handleNewMarketDetails}
                      autoComplete="off"
                      multiline="4"
                      placeholder="Enter Description"
                    />
                  </FormLayout>
                </Card>

                <Card sectioned title="Country/State">
                  <Scrollable className="Market-Edit-Countries-Scroll">
                    <CheckboxTree
                      nodes={countriesList}
                      checked={checkedCountries}
                      expanded={expandedCountry}
                      onCheck={(checked) => handleCheckedCountries(checked)}
                      onExpand={(expanded) => setExpandedCountry(expanded)}
                      icons={{
                        check: <img src={FillCheckBox} alt="checkbox" />,
                        halfCheck: (
                          <span className="Polaris-Icon-Half-Check">
                            <svg
                              viewBox="0 0 20 20"
                              className="Polaris-Icon__Svg"
                              focusable="false"
                              aria-hidden="true"
                            >
                              <path d="M14.167 9h-8.334c-.46 0-.833.448-.833 1s.372 1 .833 1h8.334c.46 0 .833-.448.833-1s-.373-1-.833-1"></path>{" "}
                            </svg>
                          </span>
                        ),
                        uncheck: <img src={EmptyCheckBox} alt="checkbox" />,
                        expandClose: <Icon source={ChevronDownMinor} />,
                        expandOpen: <Icon source={ChevronUpMinor} />,
                      }}
                    />
                  </Scrollable>
                </Card>
              </Layout.Section>
              <Layout.Section oneThird>
                <Card title="Market Status" sectioned>
                  <CustomSelect
                    name="status"
                    value={newMarket.status}
                    onChange={handleNewMarketDetails}
                    options={[
                      { label: "Active", value: "1" },
                      { label: "Draft", value: "0" },
                    ]}
                  />
                </Card>
                <Card
                  title="Select Vendor"
                  sectioned
                  actions={[
                    {
                      content: "Manage",
                      onAction: () => {
                        setTagsModal(true);
                      },
                    },
                  ]}
                >
                  <Autocomplete
                    // actionBefore={
                    //     console.log('Action Clicked!')
                    // }
                    allowMultiple
                    options={tagOptions}
                    selected={tagOptionsSelected}
                    textField={tagTextField}
                    loading={optionsLoading}
                    onSelect={setTagOptionsSelected}
                    listTitle="Available Vendors"
                  />
                  {tagsContentMarkup}
                </Card>
              </Layout.Section>
            </Layout>

            {/* <Card title="Vendor Information">
              <Card.Section
                actions={[
                  {
                    content: "Manage",
                    onAction: () => {
                      setTagsModal(true);
                    },
                  },
                ]}
              >
                <div className="Product-Tags">
                  <Autocomplete
                    // actionBefore={
                    //     console.log('Action Clicked!')
                    // }
                    allowMultiple
                    options={tagOptions}
                    selected={tagOptionsSelected}
                    textField={tagTextField}
                    loading={optionsLoading}
                    onSelect={setTagOptionsSelected}
                    listTitle="Available Vendors"
                  />
                  {tagsContentMarkup}
                </div>
              </Card.Section>
            </Card> */}
          </Form>

          <div className="Polaris-Product-Actions">
            <br />
            <PageActions
              primaryAction={{
                content: "Save Market",
                onAction: handleUpdateMarket,
                loading: btnLoading["updateMarket"],
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
