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
};

const honda: Vehicle = {
  id: "honda",
  name: "2016 Honda Odyssey",
  short: "H",
  mileage: "92,140",
  recommendation: "Oil change",
  timing: "Coming due",
  history: [
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
  canada: {
    label: "Canada · Instacart",
    summary: "The structure remains the same, while pricing and appointments are omitted.",
    market: "Canada",
    affiliation: "Instacart",
    membership: "Plus · included",
    vehicles: [toyota],
    activities: [],
    defaultSection: "Plan",
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
  const [selectedService, setSelectedService] = useState<string | null>(null);
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
  const membershipReady = !scenario.membershipRequired || membershipActivated;

  function changeScenario(key: string) {
    const next = scenarios[key];
    setScenarioKey(key);
    setArea("Service");
    setSection(next.defaultSection);
    setSelectedVehicleId(next.vehicles[0]?.id ?? "honda");
    setSwitcherOpen(false);
    setSelectedService(null);
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
    setSwitcherOpen(false);
  }

  function addSampleVehicle() {
    setAddedVehicle(true);
    setSelectedVehicleId("honda");
  }

  function startHold(item: string) {
    if (item !== "Vehicles") return;
    holdTimer.current = setTimeout(() => setSwitcherOpen(true), 500);
  }

  function endHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
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
          <button className="icon-button" aria-label={`${attentionCount} notifications`}>
            ○{attentionCount > 0 && <span className="notification-dot">{attentionCount}</span>}
          </button>
        </header>

        <div className="screen">
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
              setSelectedService={setSelectedService}
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
      </section>
    </main>
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
  setSelectedService,
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
  setSelectedService: (service: string | null) => void;
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
          <div className="ftu-state">
            <span className="large-mark">＋</span>
            <p className="eyebrow">Start with your vehicle</p>
            <h3>Get guidance that fits your car</h3>
            <p>Add a vehicle to see relevant services, maintenance timing, shops, and available benefits.</p>
            <button className="primary-button" onClick={addSampleVehicle}>ADD A VEHICLE</button>
            <button className="text-link">Browse services first</button>
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
                <article className="recommendation-card">
                  <span className="status-dot" />
                  <div>
                    <small>{selectedVehicle.timing.toUpperCase()}</small>
                    <h3>{selectedVehicle.recommendation}</h3>
                    <p>Based on {selectedVehicle.mileage} miles</p>
                  </div>
                  <button className="text-button" onClick={() => setSelectedService(selectedVehicle.recommendation)}>Select</button>
                </article>

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
                    {serviceOptions.map((service) => (
                      <button
                        key={service}
                        className={selectedService === service ? "selected" : ""}
                        onClick={() => setSelectedService(service)}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                  <button className="catalog-link">See all services <span>›</span></button>
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
