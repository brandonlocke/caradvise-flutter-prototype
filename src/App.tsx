"use client";

import { useRef, useState } from "react";

type Vehicle = {
  id: string;
  name: string;
  short: string;
  mileage: string;
  recommendation: string;
  timing: string;
  history: Array<{ date: string; service: string; shop: string }>;
};

type Activity = {
  id: string;
  group: "Needs attention" | "Today" | "Upcoming" | "Waiting";
  vehicleId: string;
  title: string;
  detail: string;
  shop: string;
  action: string;
};

type Scenario = {
  label: string;
  summary: string;
  market: "US" | "Canada";
  affiliation: string;
  membership: string;
  vehicles: Vehicle[];
  activities: Activity[];
  defaultSection: "Plan" | "Current";
  membershipRequired?: boolean;
  preformedCart?: boolean;
  offer?: {
    title: string;
    expires: string;
    detail: string;
  };
};

type Notification = {
  id: "approval" | "receipt" | "appointment";
  title: string;
  detail: string;
  vehicle: string;
  time: string;
  action: string;
  unread: boolean;
};

const honda: Vehicle = {
  id: "honda",
  name: "2016 Honda Odyssey",
  short: "H",
  mileage: "92,140",
  recommendation: "Oil change",
  timing: "Coming due",
  history: [
    { date: "Aug 17, 2026", service: "Oil change · Receipt available", shop: "Firestone" },
    { date: "Jun 18, 2026", service: "Tire rotation", shop: "Pep Boys" },
    { date: "Feb 4, 2026", service: "Oil change", shop: "Take 5" },
  ],
};

const subaru: Vehicle = {
  id: "subaru",
  name: "2019 Subaru Outback",
  short: "S",
  mileage: "48,720",
  recommendation: "Tire rotation",
  timing: "Due in about 800 miles",
  history: [
    { date: "May 9, 2026", service: "Brake inspection", shop: "Midas" },
    { date: "Jan 12, 2026", service: "Oil change", shop: "Valvoline" },
  ],
};

const toyota: Vehicle = {
  id: "toyota",
  name: "2021 Toyota RAV4",
  short: "T",
  mileage: "61,305",
  recommendation: "Cabin air filter",
  timing: "Recommended",
  history: [
    { date: "Apr 21, 2026", service: "Oil change", shop: "Mr. Lube" },
  ],
};

const audi: Vehicle = {
  id: "audi",
  name: "2020 Audi Q5",
  short: "A",
  mileage: "43,810",
  recommendation: "Multipoint inspection",
  timing: "Recommended",
  history: [],
};

const approval: Activity = {
  id: "approval",
  group: "Needs attention",
  vehicleId: "subaru",
  title: "Approval needed",
  detail: "The shop added two recommended services.",
  shop: "Midas · 1.8 miles away",
  action: "Review approval",
};

const upcoming: Activity = {
  id: "upcoming",
  group: "Upcoming",
  vehicleId: "honda",
  title: "Appointment Thursday at 10:30 AM",
  detail: "Oil change and tire rotation",
  shop: "Pep Boys · Oak Lawn",
  action: "View details",
};

const sampleNotifications: Notification[] = [
  {
    id: "approval",
    title: "Approval needed",
    detail: "Midas added two recommended services.",
    vehicle: "2019 Subaru Outback",
    time: "Just now",
    action: "Review approval",
    unread: true,
  },
  {
    id: "receipt",
    title: "Service complete",
    detail: "Your receipt is ready to view.",
    vehicle: "2016 Honda Odyssey",
    time: "Yesterday",
    action: "View receipt",
    unread: true,
  },
  {
    id: "appointment",
    title: "Appointment reminder",
    detail: "Thursday at 10:30 AM · Pep Boys",
    vehicle: "2016 Honda Odyssey",
    time: "2 days ago",
    action: "View appointment",
    unread: false,
  },
];

const scenarios: Record<string, Scenario> = {
  idle: {
    label: "Repeat user · idle",
    summary: "Plan is the default because no service requires attention.",
    market: "US",
    affiliation: "CarAdvise",
    membership: "Essential",
    vehicles: [honda, subaru],
    activities: [],
    defaultSection: "Plan",
  },
  approval: {
    label: "Cross-vehicle approval",
    summary: "A Subaru approval stays visible even while the Honda is selected for planning.",
    market: "US",
    affiliation: "USAA",
    membership: "Plus",
    vehicles: [honda, subaru],
    activities: [approval],
    defaultSection: "Current",
  },
  today: {
    label: "Service today",
    summary: "Current opens first and prioritizes same-day service across the account.",
    market: "US",
    affiliation: "CarAdvise",
    membership: "Guardian",
    vehicles: [honda, subaru],
    activities: [
      {
        id: "today",
        group: "Today",
        vehicleId: "honda",
        title: "Service in progress",
        detail: "The shop is inspecting your vehicle.",
        shop: "Take 5 · Cicero",
        action: "View service",
      },
      upcoming,
    ],
    defaultSection: "Current",
  },
  ftu: {
    label: "First-time user",
    summary: "Service explains why a vehicle is needed and returns directly to planning.",
    market: "US",
    affiliation: "CarAdvise",
    membership: "Essential",
    vehicles: [],
    activities: [],
    defaultSection: "Plan",
  },
  instacart: {
    label: "US · Instacart offer",
    summary: "An available offer stays discoverable without competing with service planning.",
    market: "US",
    affiliation: "Instacart",
    membership: "Essential",
    vehicles: [honda, subaru],
    activities: [],
    defaultSection: "Plan",
    offer: {
      title: "25% off an oil change",
      expires: "Sept. 30",
      detail: "Your Instacart benefit is applied automatically to an eligible oil change.",
    },
  },
  canada: {
    label: "Canada · Instacart",
    summary: "The structure remains the same, while pricing and appointments are omitted.",
    market: "Canada",
    affiliation: "Instacart",
    membership: "Plus · included",
    vehicles: [toyota],
    activities: [],
    defaultSection: "Plan",
    offer: {
      title: "25% off an oil change",
      expires: "Sept. 30",
      detail: "Your Instacart benefit is applied automatically to an eligible oil change.",
    },
  },
  uber: {
    label: "Canada · Uber requirement",
    summary: "The required membership is explained at the point it becomes relevant.",
    market: "Canada",
    affiliation: "Uber",
    membership: "Not active",
    vehicles: [toyota],
    activities: [],
    defaultSection: "Plan",
    membershipRequired: true,
  },
  ebay: {
    label: "eBay tire installation",
    summary: "A preformed installation cart replaces service discovery with appointment booking.",
    market: "US",
    affiliation: "eBay",
    membership: "Essential",
    vehicles: [audi],
    activities: [],
    defaultSection: "Plan",
    preformedCart: true,
  },
};

const serviceOptions = [
  "Oil change",
  "Tire rotation",
  "Brake service",
  "Battery",
  "Wheel alignment",
  "Cabin air filter",
  "Engine air filter",
  "Wiper blades",
  "Coolant service",
  "Multipoint inspection",
];
const groupOrder = ["Needs attention", "Today", "Upcoming", "Waiting"];

export default function Home() {
  const [scenarioKey, setScenarioKey] = useState("idle");
  const [area, setArea] = useState("Service");
  const [section, setSection] = useState<"Plan" | "Current">("Plan");
  const [selectedVehicleId, setSelectedVehicleId] = useState("honda");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showAllServiceChips, setShowAllServiceChips] = useState(false);
  const [offerExpanded, setOfferExpanded] = useState(false);
  const [bookingChoiceOpen, setBookingChoiceOpen] = useState(false);
  const [fulfillmentChoice, setFulfillmentChoice] = useState<"schedule" | "walkin" | null>(null);
  const [currentDetail, setCurrentDetail] = useState<string | null>(null);
  const [approvalResolved, setApprovalResolved] = useState(false);
  const [addedVehicle, setAddedVehicle] = useState(false);
  const [membershipActivated, setMembershipActivated] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [ebayBookingOpen, setEbayBookingOpen] = useState(false);
  const [ebayBooked, setEbayBooked] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = scenarios[scenarioKey];
  const vehicles = scenario.vehicles.length === 0 && addedVehicle ? [honda] : scenario.vehicles;
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicles[0];
  const ebayBookedActivity: Activity = {
    id: "ebay-booked",
    group: "Upcoming",
    vehicleId: "audi",
    title: "Installation booked · Thursday at 11:00 AM",
    detail: "Four Continental TrueContact Tour tires",
    shop: "Firestone · Evanston",
    action: "View appointment",
  };
  const scenarioActivities = scenarioKey === "ebay" && ebayBooked
    ? [...scenario.activities, ebayBookedActivity]
    : scenario.activities;
  const activities = scenarioActivities.map((activity): Activity => {
    if (approvalResolved && activity.id === "approval") {
      return {
        ...activity,
        group: "Today",
        title: "Service in progress",
        detail: "Your approval was submitted to the shop.",
        action: "View service",
      };
    }
    return activity;
  });
  const attentionCount = activities.filter((activity) => activity.group === "Needs attention").length;
  const unreadNotificationCount = sampleNotifications.filter((notification) => notification.unread).length;
  const membershipReady = !scenario.membershipRequired || membershipActivated;
  const activeForSelected = selectedVehicle
    ? activities.find((activity) => activity.vehicleId === selectedVehicle.id)
    : undefined;
  const planningService = selectedService ?? selectedVehicle?.recommendation ?? null;
  const showServiceDock = area === "Service"
    && section === "Plan"
    && vehicles.length > 0
    && Boolean(selectedVehicle)
    && !bookingChoiceOpen
    && !ebayBookingOpen;

  function changeScenario(key: string) {
    const next = scenarios[key];
    setScenarioKey(key);
    setArea("Service");
    setSection(next.defaultSection);
    setSelectedVehicleId(next.vehicles[0]?.id ?? "honda");
    setSwitcherOpen(false);
    setNotificationsOpen(false);
    setSelectedService(null);
    setShowAllServiceChips(false);
    setOfferExpanded(false);
    setBookingChoiceOpen(false);
    setFulfillmentChoice(null);
    setCurrentDetail(null);
    setApprovalResolved(false);
    setAddedVehicle(false);
    setMembershipActivated(false);
    setShowAllHistory(false);
    setEbayBookingOpen(false);
    setEbayBooked(false);
  }

  function chooseVehicle(id: string) {
    setSelectedVehicleId(id);
    setSelectedService(null);
    setShowAllServiceChips(false);
    setOfferExpanded(false);
    setBookingChoiceOpen(false);
    setFulfillmentChoice(null);
    setSwitcherOpen(false);
  }

  function addSampleVehicle() {
    setAddedVehicle(true);
    setSelectedVehicleId("honda");
  }

  function beginFulfillment(choice: "schedule" | "walkin") {
    if (!planningService) return;
    setSelectedService(planningService);
    setBookingChoiceOpen(true);
    setFulfillmentChoice(choice);
  }

  function startHold(item: string) {
    if (item !== "Vehicles") return;
    holdTimer.current = setTimeout(() => {
      setNotificationsOpen(false);
      setSwitcherOpen(true);
    }, 500);
  }

  function endHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }

  function openNotification(notification: Notification) {
    setNotificationsOpen(false);
    if (notification.id === "approval") {
      changeScenario("approval");
      return;
    }
    if (notification.id === "receipt") {
      setArea("Vehicles");
      setSelectedVehicleId("honda");
      setShowAllHistory(true);
      return;
    }
    changeScenario("today");
  }

  const detailActivity = activities.find((activity) => activity.id === currentDetail);

  return (
    <main className="prototype-shell">
      <aside className="prototype-notes">
        <p className="eyebrow">Working prototype</p>
        <h1>Three-area navigation</h1>
        <p>
          Test the architecture through representative user, market, partner,
          and membership states.
        </p>

        <label className="scenario-label" htmlFor="scenario">
          Prototype case
        </label>
        <select
          id="scenario"
          value={scenarioKey}
          onChange={(event) => changeScenario(event.target.value)}
        >
          {Object.entries(scenarios).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>

        <div className="note-card">
          <strong>{scenario.label}</strong>
          <span>{scenario.summary}</span>
        </div>

        <ul className="prototype-principles">
          <li><strong>Service</strong> owns planning and current activity.</li>
          <li><strong>Vehicles</strong> owns maintenance and history.</li>
          <li><strong>Account</strong> owns membership and benefits.</li>
          <li>Active service blocks new booking for that vehicle.</li>
          <li>eBay installation begins from its prepared cart.</li>
          <li>Hold Vehicles in the bottom nav for quick switching.</li>
        </ul>
      </aside>

      <section className="phone" aria-label="CarAdvise mobile prototype">
        <header className="app-header">
          <span className="wordmark">CarAdvise</span>
          <select
            className="mobile-case-select"
            aria-label="Prototype case"
            value={scenarioKey}
            onChange={(event) => changeScenario(event.target.value)}
          >
            {Object.entries(scenarios).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <button
            className="icon-button notification-button"
            aria-label={`${unreadNotificationCount} unread notifications`}
            onClick={() => {
              setSwitcherOpen(false);
              setNotificationsOpen(true);
            }}
          >
            ◔<span className="notification-dot">{unreadNotificationCount}</span>
          </button>
        </header>

        <div className={`screen ${showServiceDock ? "with-service-dock" : ""}`}>
          {area === "Service" && (
            <ServiceArea
              scenario={scenario}
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              activities={activities}
              attentionCount={attentionCount}
              section={section}
              setSection={setSection}
              setSwitcherOpen={setSwitcherOpen}
              selectedService={selectedService}
              showAllServiceChips={showAllServiceChips}
              toggleAllServiceChips={() => setShowAllServiceChips((show) => !show)}
              offerExpanded={offerExpanded}
              toggleOffer={() => setOfferExpanded((expanded) => !expanded)}
              selectService={(service) => {
                setSelectedService(service);
                setBookingChoiceOpen(false);
                setFulfillmentChoice(null);
              }}
              bookingChoiceOpen={bookingChoiceOpen}
              closeBookingChoice={() => {
                setBookingChoiceOpen(false);
                setFulfillmentChoice(null);
              }}
              fulfillmentChoice={fulfillmentChoice}
              currentDetail={currentDetail}
              setCurrentDetail={setCurrentDetail}
              detailActivity={detailActivity}
              resolveApproval={() => {
                setApprovalResolved(true);
                setCurrentDetail(null);
              }}
              addSampleVehicle={addSampleVehicle}
              membershipReady={membershipReady}
              openAccount={() => setArea("Account")}
              ebayBookingOpen={ebayBookingOpen}
              openEbayBooking={() => setEbayBookingOpen(true)}
              closeEbayBooking={() => setEbayBookingOpen(false)}
              confirmEbayBooking={() => {
                setEbayBookingOpen(false);
                setEbayBooked(true);
                setSection("Current");
              }}
            />
          )}

          {area === "Vehicles" && (
            <VehiclesArea
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              setSwitcherOpen={setSwitcherOpen}
              addSampleVehicle={addSampleVehicle}
              showAllHistory={showAllHistory}
              setShowAllHistory={setShowAllHistory}
              planService={() => {
                setArea("Service");
                setSection("Plan");
              }}
            />
          )}

          {area === "Account" && (
            <AccountArea
              scenario={scenario}
              membershipActivated={membershipActivated}
              activateMembership={() => setMembershipActivated(true)}
            />
          )}
        </div>

        {showServiceDock && selectedVehicle && (
          <PersistentServiceAction
            scenario={scenario}
            activeActivity={activeForSelected}
            membershipReady={membershipReady}
            viewCurrent={() => setSection("Current")}
            viewMembership={() => setArea("Account")}
            bookInstallation={() => setEbayBookingOpen(true)}
            schedule={() => beginFulfillment("schedule")}
            walkIn={() => beginFulfillment("walkin")}
          />
        )}

        <nav className="bottom-nav" aria-label="Primary navigation">
          {["Service", "Vehicles", "Account"].map((item) => (
            <button
              key={item}
              className={area === item ? "active" : ""}
              onPointerDown={() => startHold(item)}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onClick={() => setArea(item)}
              aria-label={item === "Vehicles" ? "Vehicles. Press and hold to switch vehicle." : item}
            >
              <span className="nav-icon" aria-hidden="true">
                {item === "Service" ? "＋" : item === "Vehicles" ? selectedVehicle?.short ?? "▱" : "○"}
              </span>
              {item}
              {item === "Service" && attentionCount > 0 && (
                <span className="nav-badge">{attentionCount}</span>
              )}
            </button>
          ))}
        </nav>

        {switcherOpen && (
          <div className="sheet-backdrop" role="presentation" onClick={() => setSwitcherOpen(false)}>
            <section
              className="bottom-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="switcher-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sheet-handle" />
              <div className="sheet-title-row">
                <div>
                  <p className="eyebrow">Vehicle context</p>
                  <h2 id="switcher-title">Choose a vehicle</h2>
                </div>
                <button className="close-button" onClick={() => setSwitcherOpen(false)} aria-label="Close">×</button>
              </div>
              {vehicles.map((vehicle) => {
                const vehicleAttention = activities.some(
                  (activity) => activity.vehicleId === vehicle.id && activity.group === "Needs attention",
                );
                return (
                  <button
                    className={`switcher-row ${selectedVehicle?.id === vehicle.id ? "selected" : ""}`}
                    key={vehicle.id}
                    onClick={() => chooseVehicle(vehicle.id)}
                  >
                    <span className="vehicle-mark">{vehicle.short}</span>
                    <span>
                      <strong>{vehicle.name}</strong>
                      <small>{vehicle.mileage} miles · {vehicle.recommendation}</small>
                    </span>
                    {vehicleAttention ? <span className="attention-label">Action</span> : <span>›</span>}
                  </button>
                );
              })}
              {vehicles.length === 0 && <p className="sheet-empty">No vehicles yet.</p>}
              <button className="secondary-button compact" onClick={() => {
                addSampleVehicle();
                setSwitcherOpen(false);
              }}>＋ ADD VEHICLE</button>
              {selectedService && <p className="sheet-note">Changing vehicles restarts the current service plan.</p>}
            </section>
          </div>
        )}

        {notificationsOpen && (
          <div className="sheet-backdrop" role="presentation" onClick={() => setNotificationsOpen(false)}>
            <section
              className="bottom-sheet notification-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notifications-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sheet-handle" />
              <div className="sheet-title-row notification-title-row">
                <div>
                  <p className="eyebrow">Account activity</p>
                  <h2 id="notifications-title">Notifications</h2>
                </div>
                <button className="close-button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">×</button>
              </div>
              <div className="notification-list">
                {sampleNotifications.map((notification) => (
                  <button
                    className={`notification-row ${notification.unread ? "unread" : ""}`}
                    key={notification.id}
                    onClick={() => openNotification(notification)}
                  >
                    <span className={`notification-mark ${notification.id}`}>{notification.id === "approval" ? "!" : notification.id === "receipt" ? "✓" : "□"}</span>
                    <span className="notification-copy">
                      <span className="notification-meta"><small>{notification.time}</small>{notification.unread && <i />}</span>
                      <strong>{notification.title}</strong>
                      <span>{notification.detail}</span>
                      <small>{notification.vehicle}</small>
                      <b>{notification.action} ›</b>
                    </span>
                  </button>
                ))}
              </div>
              <p className="notification-footnote">Approvals and active service also remain available under Service → Current.</p>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function PersistentServiceAction({
  scenario,
  activeActivity,
  membershipReady,
  viewCurrent,
  viewMembership,
  bookInstallation,
  schedule,
  walkIn,
}: {
  scenario: Scenario;
  activeActivity?: Activity;
  membershipReady: boolean;
  viewCurrent: () => void;
  viewMembership: () => void;
  bookInstallation: () => void;
  schedule: () => void;
  walkIn: () => void;
}) {
  let context: string | null = null;
  let title: string | null = null;
  let primaryLabel = "SCHEDULE SERVICE";
  let primaryAction = schedule;
  let secondaryLabel: string | null = "FIND A WALK-IN";
  let secondaryAction = walkIn;

  if (activeActivity) {
    context = "Active service";
    title = activeActivity.title;
    primaryLabel = "VIEW CURRENT SERVICE";
    primaryAction = viewCurrent;
    secondaryLabel = null;
  } else if (!membershipReady) {
    context = "Membership required";
    title = "Activate Plus to use the service network";
    primaryLabel = "VIEW MEMBERSHIP";
    primaryAction = viewMembership;
    secondaryLabel = null;
  } else if (scenario.preformedCart) {
    context = "eBay installation order";
    title = "Your tires are ready to schedule";
    primaryLabel = "BOOK INSTALLATION";
    primaryAction = bookInstallation;
    secondaryLabel = null;
  } else if (scenario.market === "Canada") {
    primaryLabel = "FIND A WALK-IN";
    primaryAction = walkIn;
    secondaryLabel = null;
  }

  return (
    <aside className="service-action-dock" aria-label="Service booking action">
      {context && title && (
        <div className="dock-context">
          <small>{context}</small>
          <strong>{title}</strong>
        </div>
      )}
      <div className={`dock-actions ${secondaryLabel ? "dual" : ""}`}>
        {secondaryLabel && (
          <button className="dock-secondary" onClick={secondaryAction}>{secondaryLabel}</button>
        )}
        <button className="dock-primary" onClick={primaryAction}>{primaryLabel}</button>
      </div>
    </aside>
  );
}

function ServiceArea({
  scenario,
  vehicles,
  selectedVehicle,
  activities,
  attentionCount,
  section,
  setSection,
  setSwitcherOpen,
  selectedService,
  showAllServiceChips,
  toggleAllServiceChips,
  offerExpanded,
  toggleOffer,
  selectService,
  bookingChoiceOpen,
  closeBookingChoice,
  fulfillmentChoice,
  currentDetail,
  setCurrentDetail,
  detailActivity,
  resolveApproval,
  addSampleVehicle,
  membershipReady,
  openAccount,
  ebayBookingOpen,
  openEbayBooking,
  closeEbayBooking,
  confirmEbayBooking,
}: {
  scenario: Scenario;
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  activities: Activity[];
  attentionCount: number;
  section: "Plan" | "Current";
  setSection: (section: "Plan" | "Current") => void;
  setSwitcherOpen: (open: boolean) => void;
  selectedService: string | null;
  showAllServiceChips: boolean;
  toggleAllServiceChips: () => void;
  offerExpanded: boolean;
  toggleOffer: () => void;
  selectService: (service: string) => void;
  bookingChoiceOpen: boolean;
  closeBookingChoice: () => void;
  fulfillmentChoice: "schedule" | "walkin" | null;
  currentDetail: string | null;
  setCurrentDetail: (id: string | null) => void;
  detailActivity?: Activity;
  resolveApproval: () => void;
  addSampleVehicle: () => void;
  membershipReady: boolean;
  openAccount: () => void;
  ebayBookingOpen: boolean;
  openEbayBooking: () => void;
  closeEbayBooking: () => void;
  confirmEbayBooking: () => void;
}) {
  const activeForSelected = selectedVehicle
    ? activities.find((activity) => activity.vehicleId === selectedVehicle.id)
    : undefined;
  if (currentDetail && detailActivity) {
    return (
      <div className="detail-view">
        <button className="back-button" onClick={() => setCurrentDetail(null)}>‹ Current service</button>
        <p className="eyebrow">{detailActivity.group}</p>
        <h2>{detailActivity.title}</h2>
        <p className="detail-lede">
          {vehicles.find((vehicle) => vehicle.id === detailActivity.vehicleId)?.name}<br />
          {detailActivity.shop}
        </p>
        {detailActivity.id === "approval" ? (
          <>
            <article className="line-items">
              <div><span>Original service</span><strong>$89.00</strong></div>
              <div><span>Brake fluid flush</span><strong>$124.00</strong></div>
              <div><span>Cabin air filter</span><strong>$62.00</strong></div>
              <div className="total-row"><span>New total</span><strong>$275.00</strong></div>
            </article>
            <article className="expert-inline">
              <span className="value-icon">ASE</span>
              <p><strong>Questions about the work?</strong><br />Ask an ASE-certified expert before deciding.</p>
            </article>
            <button className="primary-button" onClick={resolveApproval}>APPROVE SELECTED</button>
            <button className="secondary-button">DECLINE ADDED SERVICES</button>
          </>
        ) : (
          <article className="detail-card">
            <h3>{detailActivity.detail}</h3>
            <p>We’ll keep this status updated here. Shop details and available instructions remain part of this order.</p>
            <button className="primary-button">VIEW SHOP INSTRUCTIONS</button>
          </article>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="screen-title-row">
        <div>
          <p className="eyebrow">Service · {scenario.market}</p>
          <h2>{section === "Plan" ? (scenario.preformedCart ? "Book your tire installation" : "What does your vehicle need?") : "Your current service"}</h2>
        </div>
      </div>

      <div className="segmented" aria-label="Service sections">
        <button className={section === "Plan" ? "active" : ""} onClick={() => setSection("Plan")}>Plan</button>
        <button className={section === "Current" ? "active" : ""} onClick={() => setSection("Current")}>
          Current {activities.length > 0 && <span className="inline-count">{activities.length}</span>}
        </button>
      </div>

      {section === "Plan" ? (
        vehicles.length === 0 || !selectedVehicle ? (
          <div className="ftu-state ftu-marketing">
            <span className="large-mark">✓</span>
            <p className="eyebrow">Car care with less guesswork</p>
            <h3>Know what your car needs—and what to expect</h3>
            <p className="ftu-lede">CarAdvise brings maintenance guidance, trusted service options, and expert support into one place.</p>
            <div className="ftu-benefits">
              <article>
                <span>01</span>
                <div><strong>Stay ahead of maintenance</strong><small>See what’s coming up based on your vehicle and mileage.</small></div>
              </article>
              <article>
                <span>02</span>
                <div><strong>Know your options</strong><small>Explore nearby shops and compare available pricing before deciding.</small></div>
              </article>
              <article>
                <span>03</span>
                <div><strong>Get expert backup</strong><small>Ask an ASE-certified expert about recommended work.</small></div>
              </article>
            </div>
            <button className="primary-button" onClick={addSampleVehicle}>ADD A VEHICLE</button>
            <p className="ftu-footnote">It takes about a minute and helps personalize your experience.</p>
          </div>
        ) : (
          <>
            {attentionCount > 0 && !activeForSelected && (
              <button className="attention-banner" onClick={() => setSection("Current")}>
                <span>!</span>
                <span><strong>{attentionCount} approval needs attention</strong><small>For another vehicle on your account</small></span>
                <span>›</span>
              </button>
            )}

            <button className="vehicle-selector" onClick={() => setSwitcherOpen(true)}>
              <span className="vehicle-mark">{selectedVehicle.short}</span>
              <span>
                <small>Plan service for</small>
                <strong>{selectedVehicle.name}</strong>
              </span>
              <span className="chevron">⌄</span>
            </button>

            {activeForSelected ? (
              <BookingLocked
                activity={activeForSelected}
                openCurrent={() => setSection("Current")}
              />
            ) : scenario.preformedCart ? (
              <EbayInstallationPlan
                bookingOpen={ebayBookingOpen}
                openBooking={openEbayBooking}
                closeBooking={closeEbayBooking}
                confirmBooking={confirmEbayBooking}
              />
            ) : (
              <>
                {bookingChoiceOpen && selectedService && membershipReady ? (
                  <FulfillmentChoices
                    service={selectedService}
                    scenario={scenario}
                    choice={fulfillmentChoice}
                    close={closeBookingChoice}
                  />
                ) : (
                  <>
                <article className="recommendation-card">
                  <span className="status-dot" />
                  <div>
                    <small>{selectedVehicle.timing.toUpperCase()}</small>
                    <h3>{selectedVehicle.recommendation}</h3>
                    <p>Based on {selectedVehicle.mileage} miles</p>
                  </div>
                  <button className="text-button" onClick={() => selectService(selectedVehicle.recommendation)}>Check price</button>
                </article>

                {scenario.offer && (
                  <AvailableOffer
                    offer={scenario.offer}
                    expanded={offerExpanded}
                    toggle={toggleOffer}
                  />
                )}

                <section className="content-section">
                  <div className="section-heading-row service-heading">
                    <div>
                      <p className="eyebrow">Quick price check</p>
                      <h3>Common services</h3>
                    </div>
                    <span>{scenario.market === "US" ? "Nearby prices" : "Nearby shops"}</span>
                  </div>
                  <p className="chip-instruction">
                    Tap a service to update the map and compare what’s nearby.
                  </p>
                  <div className="chips">
                    {serviceOptions.slice(0, showAllServiceChips ? serviceOptions.length : 4).map((service) => (
                      <button
                        key={service}
                        className={selectedService === service ? "selected" : ""}
                        onClick={() => selectService(service)}
                      >
                        {service}
                      </button>
                    ))}
                    <button className="more-chip" onClick={toggleAllServiceChips}>
                      {showAllServiceChips ? "Show less" : `More services +${serviceOptions.length - 4}`}
                    </button>
                  </div>
                </section>

                {selectedService && (
                  <ServiceResults
                    service={selectedService}
                    scenario={scenario}
                    membershipReady={membershipReady}
                    openAccount={openAccount}
                  />
                )}

                {!selectedService && (
                  <article className="value-card">
                    <span className="value-icon">ASE</span>
                    <div>
                      <h3>Expert help when you need it</h3>
                      <p>Our ASE-certified experts can help you understand recommended work.</p>
                      <button className="text-link left">How expert help works</button>
                    </div>
                  </article>
                )}

                {scenario.market === "US" && <PartnerServicesModule />}
                  </>
                )}
              </>
            )}
          </>
        )
      ) : (
        <CurrentActivity
          activities={activities}
          vehicles={vehicles}
          setCurrentDetail={setCurrentDetail}
          planService={() => setSection("Plan")}
        />
      )}
    </>
  );
}

function AvailableOffer({ offer, expanded, toggle }: {
  offer: NonNullable<Scenario["offer"]>;
  expanded: boolean;
  toggle: () => void;
}) {
  return (
    <section className={`available-offer ${expanded ? "expanded" : ""}`}>
      <button className="offer-summary" onClick={toggle} aria-expanded={expanded}>
        <span className="offer-mark">%</span>
        <span>
          <small>Available offer</small>
          <strong>{offer.title}</strong>
        </span>
        <span className="offer-expiry"><small>Expires</small><strong>{offer.expires}</strong></span>
        <span className="offer-chevron">{expanded ? "⌃" : "⌄"}</span>
      </button>
      {expanded && (
        <div className="offer-detail">
          <p>{offer.detail}</p>
          <button>View offer details</button>
        </div>
      )}
    </section>
  );
}

function PartnerServicesModule() {
  const categories = [
    { icon: "◉", title: "Tires", detail: "Shop tires and compare options" },
    { icon: "◇", title: "Repairs", detail: "Engine, transmission, glass, electrical, and more" },
    { icon: "✦", title: "Roadside", detail: "Help when you need it" },
  ];

  return (
    <section className="partner-services" aria-labelledby="partner-services-title">
      <p className="eyebrow">Beyond routine maintenance</p>
      <div className="partner-services-heading">
        <h3 id="partner-services-title">More ways we can help</h3>
        <span>Available services vary</span>
      </div>
      <div className="partner-service-grid">
        {categories.map((category) => (
          <button className="partner-service-row" key={category.title}>
            <span className="partner-service-icon" aria-hidden="true">{category.icon}</span>
            <span>
              <strong>{category.title}</strong>
              <small>{category.detail}</small>
            </span>
            <span className="chevron">›</span>
          </button>
        ))}
      </div>
      <button className="catalog-link partner-catalog-link">See all services <span>›</span></button>
    </section>
  );
}

function BookingLocked({ activity, openCurrent }: {
  activity: Activity;
  openCurrent: () => void;
}) {
  return (
    <section className="booking-lock">
      <span className="lock-mark">▣</span>
      <p className="eyebrow">Booking unavailable</p>
      <h3>This vehicle already has active service</h3>
      <p>
        Finish or cancel the current appointment before planning another service
        for this vehicle.
      </p>
      <article>
        <strong>{activity.title}</strong>
        <span>{activity.shop}</span>
      </article>
      <button className="primary-button" onClick={openCurrent}>VIEW CURRENT SERVICE</button>
      <p className="lock-note">You can switch vehicles to plan service for another car.</p>
    </section>
  );
}

function EbayInstallationPlan({ bookingOpen, openBooking, closeBooking, confirmBooking }: {
  bookingOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
  confirmBooking: () => void;
}) {
  if (bookingOpen) {
    return (
      <section className="ebay-booking-flow">
        <button className="back-button" onClick={closeBooking}>‹ Your installation</button>
        <p className="eyebrow">Choose an appointment</p>
        <h3>Firestone · Evanston</h3>
        <p className="section-intro">Your four tires will be waiting at the shop.</p>
        <div className="date-options" aria-label="Appointment dates">
          <button className="selected"><strong>Thu</strong><span>20</span></button>
          <button><strong>Fri</strong><span>21</span></button>
          <button><strong>Sat</strong><span>22</span></button>
        </div>
        <div className="time-options" aria-label="Appointment times">
          <button>9:00 AM</button>
          <button className="selected">11:00 AM</button>
          <button>2:30 PM</button>
        </div>
        <button className="primary-button" onClick={confirmBooking}>CONFIRM APPOINTMENT</button>
      </section>
    );
  }

  return (
    <section className="ebay-cart">
      <div className="partner-label"><span>eBay</span><span>Installation order</span></div>
      <p className="eyebrow">Ready to schedule</p>
      <h3>Your tire installation</h3>
      <p className="cart-copy">
        Your order is already prepared. Choose an installation appointment to
        continue—there’s no need to select services again.
      </p>
      <article className="tire-order">
        <span className="tire-mark">4×</span>
        <span><strong>Continental TrueContact Tour</strong><small>235/55R19 · Installation included</small></span>
      </article>
      <button className="primary-button" onClick={openBooking}>BOOK INSTALLATION</button>
      <button className="text-link">View order details</button>
    </section>
  );
}

function ServiceResults({ service, scenario, membershipReady, openAccount }: {
  service: string;
  scenario: Scenario;
  membershipReady: boolean;
  openAccount: () => void;
}) {
  const [resultsView, setResultsView] = useState<"Map" | "List">("Map");

  if (!membershipReady) {
    return (
      <article className="membership-gate">
        <p className="eyebrow">Required to continue</p>
        <h3>Activate Plus membership</h3>
        <p>Uber Canada members need an active CarAdvise membership before using the service network.</p>
        <button className="primary-button" onClick={openAccount}>VIEW MEMBERSHIP</button>
      </article>
    );
  }

  const shops = scenario.market === "US"
    ? [
        { name: "Pep Boys", distance: "1.8 miles", detail: "Appointment or walk-in", price: "$74–$91", pin: "1" },
        { name: "Midas", distance: "3.1 miles", detail: "Walk-in", price: "$82–$96", pin: "2" },
        { name: "Firestone", distance: "4.4 miles", detail: "Appointment or walk-in", price: "$88–$104", pin: "3" },
      ]
    : [
        { name: "Mr. Lube", distance: "1.8 km", detail: "Walk-in", price: "", pin: "1" },
        { name: "Canadian Tire", distance: "3.1 km", detail: "Walk-in", price: "", pin: "2" },
        { name: "Jiffy Lube", distance: "4.6 km", detail: "Walk-in", price: "", pin: "3" },
      ];

  return (
    <section className="results-panel">
      <div className="selected-service-row">
        <span>{scenario.market === "US" ? "Comparing nearby prices" : "Showing nearby shops"}</span>
        <strong>{service}</strong>
      </div>
      <div className="results-title-row">
        <div>
          <h3>{scenario.market === "US" ? `Prices near you` : "Eligible shops near you"}</h3>
          <p className="section-intro">
            {scenario.market === "US"
              ? `Estimated totals for ${service.toLowerCase()} on this vehicle.`
              : "Pricing and appointments aren’t available in Canada; visit a nearby eligible shop as a walk-in."}
          </p>
        </div>
        <div className="view-toggle" aria-label="Results view">
          {(["Map", "List"] as const).map((view) => (
            <button
              key={view}
              className={resultsView === view ? "active" : ""}
              onClick={() => setResultsView(view)}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
      {resultsView === "Map" ? (
        <div className="price-map" aria-label={`Nearby results for ${service}`}>
          <span className="map-road road-one" />
          <span className="map-road road-two" />
          <span className="map-road road-three" />
          {shops.map((shop, index) => (
            <span className={`map-pin pin-${index + 1}`} key={shop.name} aria-label={shop.name}>
              {shop.pin}
            </span>
          ))}
          <span className="map-you">You</span>
          <div className="map-result-card">
            <span><strong>{shops[0].name}</strong><small>{shops[0].distance} · {shops[0].detail}</small></span>
            <strong>{scenario.market === "US" ? shops[0].price : "Nearby"}</strong>
          </div>
        </div>
      ) : (
        <div className="shop-list">
          {shops.map((shop) => (
            <article className="shop-row" key={shop.name}>
              <span><strong>{shop.name}</strong><small>{shop.distance} · {shop.detail}</small></span>
              <strong>{scenario.market === "US" ? shop.price : "Nearby"}</strong>
            </article>
          ))}
        </div>
      )}
      <p className="comparison-note">
        {scenario.market === "US"
          ? "Price checking doesn’t start a booking. Final pricing is confirmed before service."
          : "Shop checking doesn’t start a service request."}
      </p>
    </section>
  );
}

function FulfillmentChoices({ service, scenario, choice, close }: {
  service: string;
  scenario: Scenario;
  choice: "schedule" | "walkin" | null;
  close: () => void;
}) {
  if (!choice) return null;

  const isCanada = scenario.market === "Canada";
  const isSchedule = choice === "schedule";

  return (
    <section className="fulfillment-panel" aria-labelledby="fulfillment-title">
      <div className="fulfillment-heading">
        <div>
          <p className="eyebrow">{isSchedule ? "Schedule service" : "Walk-in service"}</p>
          <h3 id="fulfillment-title">{isSchedule ? "Choose an appointment" : "Find a walk-in"}</h3>
        </div>
        <button className="close-button small-close" onClick={close} aria-label="Close booking flow">×</button>
      </div>
      <p className="fulfillment-intro">
        {isSchedule
          ? "Select a shop, then choose an available date and time."
          : isCanada
            ? "Choose a participating shop and visit as a walk-in. Appointments aren’t available in Canada."
            : "Find a participating shop for service today. We recommend calling before you go."}
      </p>

      <div className="booking-steps" aria-label="Booking steps">
        <span className="active">1 <small>Service</small></span>
        <span>2 <small>Shop</small></span>
        {isSchedule && <span>3 <small>Time</small></span>}
      </div>

      <article className="flow-service-row">
        <span className="status-dot" />
        <div><small>SERVICE</small><strong>{service}</strong></div>
        <button>Change</button>
      </article>

      <button className="primary-button flow-primary">
        {isSchedule ? "CHOOSE A SHOP" : "FIND WALK-IN SHOPS"}
      </button>
      <p className="flow-boundary-note">
        {isSchedule ? "No appointment is created until you confirm a time." : "No service request has been created yet."}
      </p>
    </section>
  );
}

function CurrentActivity({ activities, vehicles, setCurrentDetail, planService }: {
  activities: Activity[];
  vehicles: Vehicle[];
  setCurrentDetail: (id: string) => void;
  planService: () => void;
}) {
  if (activities.length === 0) {
    return (
      <div className="empty-state">
        <span>✓</span>
        <h3>Nothing needs your attention</h3>
        <p>Appointments, walk-ins, approvals, and current service across all vehicles will appear here.</p>
        <button className="secondary-button" onClick={planService}>PLAN SERVICE</button>
        <button className="text-link">Looking for past service? View vehicle history</button>
      </div>
    );
  }

  return (
    <div className="activity-list">
      <div className="account-scope-note"><span>◎</span> Showing current service for all vehicles</div>
      {groupOrder.map((group) => {
        const grouped = activities.filter((activity) => activity.group === group);
        if (grouped.length === 0) return null;
        return (
          <section className="activity-group" key={group}>
            <h3>{group}</h3>
            {grouped.map((activity) => {
              const vehicle = vehicles.find((item) => item.id === activity.vehicleId);
              return (
                <article className={`activity-card ${group === "Needs attention" ? "urgent" : ""}`} key={activity.id}>
                  <div className="activity-vehicle">
                    <span className="vehicle-mark small">{vehicle?.short}</span>
                    <span>{vehicle?.name}</span>
                  </div>
                  <h4>{activity.title}</h4>
                  <p>{activity.detail}</p>
                  <small>{activity.shop}</small>
                  <button className={group === "Needs attention" ? "primary-button" : "secondary-button"} onClick={() => setCurrentDetail(activity.id)}>
                    {activity.action.toUpperCase()}
                  </button>
                </article>
              );
            })}
          </section>
        );
      })}
      <button className="catalog-link" onClick={planService}>Plan another service <span>›</span></button>
    </div>
  );
}

function VehiclesArea({ vehicles, selectedVehicle, setSwitcherOpen, addSampleVehicle, showAllHistory, setShowAllHistory, planService }: {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  setSwitcherOpen: (open: boolean) => void;
  addSampleVehicle: () => void;
  showAllHistory: boolean;
  setShowAllHistory: (show: boolean) => void;
  planService: () => void;
}) {
  if (vehicles.length === 0 || !selectedVehicle) {
    return (
      <>
        <p className="eyebrow">Vehicles</p>
        <h2 className="area-title">Your vehicles</h2>
        <div className="ftu-state compact-state">
          <span className="large-mark">＋</span>
          <h3>Add your first vehicle</h3>
          <p>Build a maintenance schedule and keep service records in one place.</p>
          <button className="primary-button" onClick={addSampleVehicle}>ADD A VEHICLE</button>
        </div>
      </>
    );
  }

  const historyVehicles = showAllHistory ? vehicles : [selectedVehicle];

  return (
    <>
      <p className="eyebrow">Vehicles</p>
      <h2 className="area-title">Your vehicle record</h2>
      <button className="vehicle-selector" onClick={() => setSwitcherOpen(true)}>
        <span className="vehicle-mark">{selectedVehicle.short}</span>
        <span><small>Viewing</small><strong>{selectedVehicle.name}</strong></span>
        <span className="chevron">⌄</span>
      </button>

      <section className="vehicle-summary-grid">
        <article><small>ODOMETER</small><strong>{selectedVehicle.mileage}</strong><button>Update</button></article>
        <article><small>NEXT UP</small><strong>{selectedVehicle.recommendation}</strong><span>{selectedVehicle.timing}</span></article>
      </section>

      <section className="maintenance-card">
        <div><p className="eyebrow">Maintenance schedule</p><h3>Stay ahead of what’s next</h3></div>
        <ul>
          <li><span className="timeline-dot due" /><span><strong>{selectedVehicle.recommendation}</strong><small>{selectedVehicle.timing}</small></span><button onClick={planService}>Plan</button></li>
          <li><span className="timeline-dot" /><span><strong>Multipoint inspection</strong><small>At the next service</small></span></li>
          <li><span className="timeline-dot" /><span><strong>Brake inspection</strong><small>In about 4,000 miles</small></span></li>
        </ul>
      </section>

      <section className="history-section">
        <div className="section-heading-row">
          <div><p className="eyebrow">Permanent record</p><h3>Service history</h3></div>
          {vehicles.length > 1 && <button onClick={() => setShowAllHistory(!showAllHistory)}>{showAllHistory ? "This vehicle" : "All vehicles"}</button>}
        </div>
        {historyVehicles.flatMap((vehicle) => vehicle.history.map((item) => (
          <button className="history-row" key={`${vehicle.id}-${item.date}-${item.service}`}>
            <span><strong>{item.service}</strong><small>{showAllHistory && `${vehicle.name} · `}{item.shop} · {item.date}</small></span><span>Receipt ›</span>
          </button>
        )))}
        {historyVehicles.every((vehicle) => vehicle.history.length === 0) && <p className="empty-copy">Completed service will appear here.</p>}
      </section>
    </>
  );
}

function AccountArea({ scenario, membershipActivated, activateMembership }: {
  scenario: Scenario;
  membershipActivated: boolean;
  activateMembership: () => void;
}) {
  const membershipName = membershipActivated ? "Plus" : scenario.membership;
  return (
    <>
      <p className="eyebrow">Account</p>
      <h2 className="area-title">Your account</h2>

      <article className={`membership-card ${scenario.membershipRequired && !membershipActivated ? "required" : ""}`}>
        <div className="membership-topline"><span>Membership</span><span>{scenario.affiliation}</span></div>
        <h3>{membershipName}</h3>
        <p>
          {scenario.membershipRequired && !membershipActivated
            ? "An active membership is required to use CarAdvise through Uber Canada."
            : `Your ${scenario.affiliation} eligibility and CarAdvise benefits are active.`}
        </p>
        {scenario.membershipRequired && !membershipActivated ? (
          <button className="primary-button" onClick={activateMembership}>CHOOSE PLUS</button>
        ) : (
          <button className="secondary-button">VIEW PLAN DETAILS</button>
        )}
      </article>

      <section className="account-section">
        <h3>Your benefits</h3>
        <button className="setting-row"><span><strong>ASE-certified expert help</strong><small>Available when service gets confusing</small></span><span>›</span></button>
        {scenario.market === "US" && <button className="setting-row"><span><strong>Local price comparison</strong><small>Shown after you select a service</small></span><span>›</span></button>}
        {membershipName.includes("Guardian") && <button className="setting-row"><span><strong>Roadside assistance</strong><small>Coverage active</small></span><span>›</span></button>}
        <button className="setting-row"><span><strong>Rewards</strong><small>1,150 points available</small></span><span>›</span></button>
      </section>

      <section className="account-section">
        <h3>Account settings</h3>
        {["Profile and contact", "Payment methods", "Communication preferences", "Support"].map((item) => (
          <button className="setting-row simple" key={item}><span>{item}</span><span>›</span></button>
        ))}
      </section>
    </>
  );
}
